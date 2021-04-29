import { writeFileSync } from 'fs';
import {
  ConfigMap,
  Service,
  Namespace,
  PersistentVolume,
  PersistentVolumeClaim,
} from 'kubernetes-types/core/v1';
import { Deployment } from 'kubernetes-types/apps/v1';
import { Ingress } from 'kubernetes-types/networking/v1beta1';
import { stringify } from 'yaml';

const enum HostType {
  Prod = `prod`,
  Local = `local`,
}
const HOST_TYPE: HostType = process.env.HOST_TYPE as HostType;
const PROJECT_NAME = process.env.PROJECT_NAME;
const POSTGRES_USER = process.env.POSTGRES_USER;
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
const POSTGRES_INTERNAL_PORT = +(process.env.POSTGRES_INTERNAL_PORT || `5432`);
const POSTGRES_PORT = +(process.env.POSTGRES_PORT || `5432`);
const POSTGRES_DATABASE = process.env.POSTGRES_DATABASE || PROJECT_NAME;
const ROOT_POSTGRES_USER =
  process.env.ROOT_POSTGRES_USER || `${PROJECT_NAME}_admin`;
const ROOT_POSTGRES_PASSWORD =
  process.env.ROOT_POSTGRES_PASSWORD || POSTGRES_PASSWORD;
const DOCKER_FRONTEND_IMAGE = process.env.DOCKER_FRONTEND_IMAGE;
const DOCKER_BACKEND_IMAGE = process.env.DOCKER_BACKEND_IMAGE;
const LETSENCRYPT_EMAIL = process.env.LETSENCRYPT_EMAIL;
const PROJECT_DOMAIN = process.env.PROJECT_DOMAIN;
const PROJECT_BACKEND_INGRESS_PATH = process.env.PROJECT_BACKEND_INGRESS_PATH;
const PROJECT_FRONTEND_INGRESS_PATH = process.env.PROJECT_FRONTEND_INGRESS_PATH;
const PROJECT_FRONTEND_INGRESS_REWRITE_TARGET =
  process.env.PROJECT_FRONTEND_INGRESS_REWRITE_TARGET;

const PROJECT_CONFIG = {
  [`./k8s/${HOST_TYPE}/0.namespace.yaml`]: <Namespace>{
    apiVersion: `v1`,
    kind: `Namespace`,
    metadata: {
      name: `${PROJECT_NAME}-${HOST_TYPE}`,
    },
  },
  [`./k8s/${HOST_TYPE}/1.configmap.yaml`]: <ConfigMap>{
    apiVersion: `v1`,
    kind: `ConfigMap`,
    metadata: {
      namespace: `${PROJECT_NAME}-${HOST_TYPE}`,
      name: `${PROJECT_NAME}-config`,
    },
    data: {
      POSTGRES_URL: `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres.global-postgres-${process.env.HOST_TYPE}:${POSTGRES_INTERNAL_PORT}/${POSTGRES_DATABASE}?schema=public`,
    },
  },
  [`./k8s/${HOST_TYPE}/2.frontend-deployment.yaml`]: <Deployment>{
    apiVersion: `apps/v1`,
    kind: `Deployment`,
    metadata: {
      namespace: `${PROJECT_NAME}-${HOST_TYPE}`,
      name: `${PROJECT_NAME}-frontend`,
      labels: {
        app: `${PROJECT_NAME}-frontend`,
      },
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          pod: `${PROJECT_NAME}-frontend-container`,
        },
      },
      template: {
        metadata: {
          namespace: `${PROJECT_NAME}-${HOST_TYPE}`,
          labels: {
            pod: `${PROJECT_NAME}-frontend-container`,
          },
        },
        spec: {
          containers: [
            {
              name: `${PROJECT_NAME}-frontend`,
              image: DOCKER_FRONTEND_IMAGE,
              imagePullPolicy:
                HOST_TYPE === HostType.Local ? `Never` : `Always`,
              ports: [
                {
                  containerPort: 9090,
                },
              ],
              resources: {
                requests: {
                  memory: `64Mi`,
                  cpu: `50m`,
                },
                limits: {
                  memory: `128Mi`,
                  cpu: `100m`,
                },
              },
            },
          ],
          ...(HOST_TYPE === HostType.Local
            ? {}
            : {
                imagePullSecrets: [
                  {
                    name: `docker-hub-regcred`,
                  },
                ],
              }),
        },
      },
    },
  },
  [`./k8s/${HOST_TYPE}/3.backend-deployment.yaml`]: <Deployment>{
    apiVersion: `apps/v1`,
    kind: `Deployment`,
    metadata: {
      namespace: `${PROJECT_NAME}-${HOST_TYPE}`,
      name: `${PROJECT_NAME}-backend`,
      labels: {
        app: `${PROJECT_NAME}-backend`,
      },
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          pod: `${PROJECT_NAME}-backend-container`,
        },
      },
      template: {
        metadata: {
          namespace: `${PROJECT_NAME}-${HOST_TYPE}`,
          labels: {
            pod: `${PROJECT_NAME}-backend-container`,
          },
        },
        spec: {
          containers: [
            {
              name: `${PROJECT_NAME}-backend`,
              image: DOCKER_BACKEND_IMAGE,
              imagePullPolicy:
                HOST_TYPE === HostType.Local ? `Never` : `Always`,
              ports: [
                {
                  containerPort: 5000,
                },
              ],

              envFrom: [
                {
                  configMapRef: {
                    name: `${PROJECT_NAME}-config`,
                  },
                },
              ],
              resources: {
                requests: {
                  memory: `64Mi`,
                  cpu: `75m`,
                },
                limits: {
                  memory: `128Mi`,
                  cpu: `150m`,
                },
              },
            },
          ],
          ...(HOST_TYPE === HostType.Local
            ? {}
            : {
                imagePullSecrets: [
                  {
                    name: `docker-hub-regcred`,
                  },
                ],
              }),
        },
      },
    },
  },
  [`./k8s/${HOST_TYPE}/4.frontend-service.yaml`]: <Service>{
    kind: `Service`,
    apiVersion: `v1`,
    metadata: {
      namespace: `${PROJECT_NAME}-${HOST_TYPE}`,
      name: `${PROJECT_NAME}-frontend-service`,
    },
    spec: {
      selector: {
        pod: `${PROJECT_NAME}-frontend-container`,
      },
      ports: [
        {
          protocol: `TCP`,
          port: 9090,
          targetPort: 9090,
        },
      ],
      type: `ClusterIP`,
    },
  },
  [`./k8s/${HOST_TYPE}/5.backend-service.yaml`]: <Service>{
    kind: `Service`,
    apiVersion: `v1`,
    metadata: {
      namespace: `${PROJECT_NAME}-${HOST_TYPE}`,
      name: `${PROJECT_NAME}-backend-service`,
    },
    spec: {
      selector: {
        pod: `${PROJECT_NAME}-backend-container`,
      },
      ports: [
        {
          protocol: `TCP`,
          port: 5000,
          targetPort: 5000,
        },
      ],
      type: `ClusterIP`,
    },
  },
  [`./k8s/${HOST_TYPE}/6.issuer.yaml`]: {
    apiVersion: `cert-manager.io/v1alpha2`,
    kind: `ClusterIssuer`,
    metadata: {
      name: `letsencrypt-${HOST_TYPE}`,
      namespace: `cert-manager`,
    },
    spec: {
      acme: {
        server:
          HOST_TYPE === HostType.Local
            ? `https://acme-staging-v02.api.letsencrypt.org/directory`
            : `https://acme-v02.api.letsencrypt.org/directory`,
        email: LETSENCRYPT_EMAIL,
        privateKeySecretRef: {
          name: `letsencrypt-${HOST_TYPE}`,
        },
        solvers: [
          {
            http01: {
              ingress: {
                class: `nginx`,
              },
            },
          },
        ],
      },
    },
  },
  [`./k8s/${HOST_TYPE}/7.backend-ingress.yaml`]: <Ingress>{
    apiVersion: `networking.k8s.io/v1beta1`,
    kind: `Ingress`,
    metadata: {
      namespace: `${PROJECT_NAME}-${HOST_TYPE}`,
      name: `${PROJECT_NAME}-backend-ingress`,
      annotations: {
        [`kubernetes.io/ingress.class`]: `nginx`,
        [`cert-manager.io/cluster-issuer`]: `letsencrypt-${HOST_TYPE}`,
        [`nginx.ingress.kubernetes.io/proxy-read-timeout`]: `1800`,
        [`nginx.ingress.kubernetes.io/proxy-send-timeout`]: `1800`,
        [`nginx.ingress.kubernetes.io/rewrite-target`]: `/api/$2`,
        [`nginx.ingress.kubernetes.io/secure-backends`]: `true`,
        [`nginx.ingress.kubernetes.io/ssl-redirect`]: `true`,
        [`nginx.ingress.kubernetes.io/websocket-services`]: `${PROJECT_NAME}-backend-service`,
        [`nginx.org/websocket-services`]: `${PROJECT_NAME}-backend-service`,
      },
    },
    spec: {
      tls: [
        {
          hosts: [PROJECT_DOMAIN],
          secretName: `echo-tls`,
        },
      ],
      rules: [
        {
          host: PROJECT_DOMAIN,
          http: {
            paths: [
              {
                path: PROJECT_BACKEND_INGRESS_PATH,
                backend: {
                  serviceName: `${PROJECT_NAME}-backend-service`,
                  servicePort: 5000,
                },
              },
            ],
          },
        },
      ],
    },
  },
  [`./k8s/${HOST_TYPE}/8.frontend-ingress.yaml`]: <Ingress>{
    apiVersion: `networking.k8s.io/v1beta1`,
    kind: `Ingress`,
    metadata: {
      namespace: `${PROJECT_NAME}-${HOST_TYPE}`,
      name: `${PROJECT_NAME}-frontend-ingress`,
      annotations: {
        [`kubernetes.io/ingress.class`]: `nginx`,
        [`cert-manager.io/cluster-issuer`]: `letsencrypt-${HOST_TYPE}`,
        [`nginx.ingress.kubernetes.io/proxy-read-timeout`]: `1800`,
        [`nginx.ingress.kubernetes.io/proxy-send-timeout`]: `1800`,
        [`nginx.ingress.kubernetes.io/rewrite-target`]: PROJECT_FRONTEND_INGRESS_REWRITE_TARGET,
        [`nginx.ingress.kubernetes.io/secure-backends`]: `true`,
        [`nginx.ingress.kubernetes.io/ssl-redirect`]: `true`,
      },
    },
    spec: {
      tls: [
        {
          hosts: [PROJECT_DOMAIN],
          secretName: `echo-tls`,
        },
      ],
      rules: [
        {
          host: PROJECT_DOMAIN,
          http: {
            paths: [
              {
                path: PROJECT_FRONTEND_INGRESS_PATH,
                backend: {
                  serviceName: `${PROJECT_NAME}-frontend-service`,
                  servicePort: 9090,
                },
              },
            ],
          },
        },
      ],
    },
  },
};

const DATABASE_CONFIG = {
  [`./k8s/${HOST_TYPE}/postgres/services/global-service.yaml`]: <Service>{
    apiVersion: `v1`,
    kind: `Service`,
    metadata: {
      namespace: `global-postgres-${HOST_TYPE}`,
      name: `${PROJECT_NAME}-global-postgres`,
      labels: {
        app: `postgres`,
      },
    },
    spec: {
      type: `NodePort`,
      ports: [
        {
          port: POSTGRES_INTERNAL_PORT,
          nodePort: POSTGRES_PORT,
        },
      ],
      selector: {
        app: `postgres`,
      },
    },
  },
  [`./k8s/${HOST_TYPE}/postgres/0.namespace.yaml`]: <Namespace>{
    apiVersion: `v1`,
    kind: `Namespace`,
    metadata: {
      name: `global-postgres-${HOST_TYPE}`,
    },
  },
  [`./k8s/${HOST_TYPE}/postgres/1.configmap.yaml`]: <ConfigMap>{
    apiVersion: `v1`,
    kind: `ConfigMap`,
    metadata: {
      namespace: `global-postgres-${HOST_TYPE}`,
      name: `postgres-config`,
      labels: {
        app: `postgres`,
      },
    },
    data: {
      POSTGRES_USER: ROOT_POSTGRES_USER,
      POSTGRES_PASSWORD: ROOT_POSTGRES_PASSWORD,
    },
  },
  [`./k8s/${HOST_TYPE}/postgres/2.storage.yaml`]: [
    <PersistentVolume>{
      kind: `PersistentVolume`,
      apiVersion: `v1`,
      metadata: {
        namespace: `global-postgres-${HOST_TYPE}`,
        name: `global-postgres-pv-volume`,
        labels: {
          type: `local`,
          app: `postgres`,
        },
      },
      spec: {
        storageClassName: `manual`,
        capacity: {
          storage: `20Gi`,
        },
        accessModes: [`ReadWriteMany`],
        hostPath: {
          path: `/mnt/global-postgres-data`,
        },
      },
    },
    <PersistentVolumeClaim>{
      kind: `PersistentVolumeClaim`,
      apiVersion: `v1`,
      metadata: {
        namespace: `global-postgres-${HOST_TYPE}`,
        name: `global-postgres-pv-claim`,
        labels: {
          app: `postgres`,
        },
      },
      spec: {
        storageClassName: `manual`,
        accessModes: [`ReadWriteMany`],
        resources: {
          requests: {
            storage: `20Gi`,
          },
        },
      },
    },
  ],
  [`./k8s/${HOST_TYPE}/postgres/3.deployment.yaml`]: <Deployment>{
    apiVersion: `apps/v1`,
    kind: `Deployment`,
    metadata: {
      namespace: `global-postgres-${HOST_TYPE}`,
      name: `postgres`,
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          pod: `postgres-container`,
        },
      },
      template: {
        metadata: {
          namespace: `global-postgres-${HOST_TYPE}`,
          labels: {
            app: `postgres`,
            pod: `postgres-container`,
          },
        },
        spec: {
          containers: [
            {
              name: `postgres`,
              image: `postgres:13`,
              imagePullPolicy: `IfNotPresent`,
              ports: [
                {
                  containerPort: POSTGRES_INTERNAL_PORT,
                },
              ],
              envFrom: [
                {
                  configMapRef: {
                    name: `postgres-config`,
                  },
                },
              ],
              volumeMounts: [
                {
                  mountPath: `/var/lib/postgresql/data`,
                  name: `postgredb`,
                },
              ],
              resources: {
                requests: {
                  memory: `100Mi`,
                  cpu: `200m`,
                },
                limits: {
                  memory: `1000Mi`,
                  cpu: `1`,
                },
              },
            },
          ],
          volumes: [
            {
              name: `postgredb`,
              persistentVolumeClaim: {
                claimName: `global-postgres-pv-claim`,
              },
            },
          ],
        },
      },
    },
  },
  [`./k8s/${HOST_TYPE}/postgres/4.service.yaml`]: <Service>{
    apiVersion: `v1`,
    kind: `Service`,
    metadata: {
      namespace: `global-postgres-${HOST_TYPE}`,
      name: `postgres`,
      labels: {
        app: `postgres`,
      },
    },
    spec: {
      selector: {
        app: `postgres`,
      },
      ports: [
        {
          protocol: `TCP`,
          port: POSTGRES_INTERNAL_PORT,
          targetPort: POSTGRES_INTERNAL_PORT,
        },
      ],
      type: `ClusterIP`,
    },
  },
};

Object.keys(PROJECT_CONFIG).map((file) =>
  writeFileSync(file, stringify(PROJECT_CONFIG[file]))
);

Object.keys(DATABASE_CONFIG).map((file) =>
  writeFileSync(
    file,
    Array.isArray(DATABASE_CONFIG[file])
      ? (DATABASE_CONFIG[file] as []).map((v) => stringify(v)).join(`---\n`)
      : stringify(DATABASE_CONFIG[file])
  )
);
