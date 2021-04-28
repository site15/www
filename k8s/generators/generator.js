"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var _a, _b, _c, _d;
exports.__esModule = true;
var fs_1 = require("fs");
var yaml_1 = require("yaml");
var HOST_TYPE = process.env.HOST_TYPE;
var PROJECT_NAME = process.env.PROJECT_NAME;
var POSTGRES_USER = process.env.POSTGRES_USER;
var POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
var POSTGRES_INTERNAL_PORT = +(process.env.POSTGRES_INTERNAL_PORT || "5432");
var POSTGRES_PORT = +(process.env.POSTGRES_PORT || "5432");
var POSTGRES_DATABASE = process.env.POSTGRES_DATABASE || PROJECT_NAME;
var ROOT_POSTGRES_USER = process.env.ROOT_POSTGRES_USER || PROJECT_NAME + "_admin";
var ROOT_POSTGRES_PASSWORD = process.env.ROOT_POSTGRES_PASSWORD || POSTGRES_PASSWORD;
var DOCKER_FRONTEND_IMAGE = process.env.DOCKER_FRONTEND_IMAGE;
var DOCKER_BACKEND_IMAGE = process.env.DOCKER_BACKEND_IMAGE;
var LETSENCRYPT_EMAIL = process.env.LETSENCRYPT_EMAIL;
var PROJECT_DOMAIN = process.env.PROJECT_DOMAIN;
var PROJECT_BACKEND_INGRESS_PATH = process.env.PROJECT_BACKEND_INGRESS_PATH;
var PROJECT_FRONTEND_INGRESS_PATH = process.env.PROJECT_FRONTEND_INGRESS_PATH;
var PROJECT_FRONTEND_INGRESS_REWRITE_TARGET = process.env.PROJECT_FRONTEND_INGRESS_REWRITE_TARGET;
var PROJECT_CONFIG = (_a = {},
    _a["./k8s/" + HOST_TYPE + "/0.namespace.yaml"] = {
        apiVersion: "v1",
        kind: "Namespace",
        metadata: {
            name: PROJECT_NAME + "-" + HOST_TYPE
        }
    },
    _a["./k8s/" + HOST_TYPE + "/1.configmap.yaml"] = {
        apiVersion: "v1",
        kind: "ConfigMap",
        metadata: {
            namespace: PROJECT_NAME + "-" + HOST_TYPE,
            name: PROJECT_NAME + "-config"
        },
        data: {
            POSTGRES_URL: "postgres://" + POSTGRES_USER + ":" + POSTGRES_PASSWORD + "@postgres.global-postgres-" + process.env.HOST_TYPE + ":" + POSTGRES_INTERNAL_PORT + "/" + POSTGRES_DATABASE + "?schema=public"
        }
    },
    _a["./k8s/" + HOST_TYPE + "/2.frontend-deployment.yaml"] = {
        apiVersion: "apps/v1",
        kind: "Deployment",
        metadata: {
            namespace: PROJECT_NAME + "-" + HOST_TYPE,
            name: PROJECT_NAME + "-frontend",
            labels: {
                app: PROJECT_NAME + "-frontend"
            }
        },
        spec: {
            replicas: 1,
            selector: {
                matchLabels: {
                    pod: PROJECT_NAME + "-frontend-container"
                }
            },
            template: {
                metadata: {
                    namespace: PROJECT_NAME + "-" + HOST_TYPE,
                    labels: {
                        pod: PROJECT_NAME + "-frontend-container"
                    }
                },
                spec: __assign({ containers: [
                        {
                            name: PROJECT_NAME + "-frontend",
                            image: DOCKER_FRONTEND_IMAGE,
                            imagePullPolicy: HOST_TYPE === "local" /* Local */ ? "Never" : "Always",
                            ports: [
                                {
                                    containerPort: 9090
                                },
                            ],
                            resources: {
                                requests: {
                                    memory: "64Mi",
                                    cpu: "50m"
                                },
                                limits: {
                                    memory: "128Mi",
                                    cpu: "100m"
                                }
                            }
                        },
                    ] }, (HOST_TYPE === "local" /* Local */
                    ? {}
                    : {
                        imagePullSecrets: [
                            {
                                name: "docker-hub-regcred"
                            },
                        ]
                    }))
            }
        }
    },
    _a["./k8s/" + HOST_TYPE + "/3.backend-deployment.yaml"] = {
        apiVersion: "apps/v1",
        kind: "Deployment",
        metadata: {
            namespace: PROJECT_NAME + "-" + HOST_TYPE,
            name: PROJECT_NAME + "-backend",
            labels: {
                app: PROJECT_NAME + "-backend"
            }
        },
        spec: {
            replicas: 1,
            selector: {
                matchLabels: {
                    pod: PROJECT_NAME + "-backend-container"
                }
            },
            template: {
                metadata: {
                    namespace: PROJECT_NAME + "-" + HOST_TYPE,
                    labels: {
                        pod: PROJECT_NAME + "-backend-container"
                    }
                },
                spec: __assign({ containers: [
                        {
                            name: PROJECT_NAME + "-backend",
                            image: DOCKER_BACKEND_IMAGE,
                            imagePullPolicy: HOST_TYPE === "local" /* Local */ ? "Never" : "Always",
                            ports: [
                                {
                                    containerPort: 5000
                                },
                            ],
                            envFrom: [
                                {
                                    configMapRef: {
                                        name: PROJECT_NAME + "-config"
                                    }
                                },
                            ],
                            resources: {
                                requests: {
                                    memory: "64Mi",
                                    cpu: "75m"
                                },
                                limits: {
                                    memory: "128Mi",
                                    cpu: "150m"
                                }
                            }
                        },
                    ] }, (HOST_TYPE === "local" /* Local */
                    ? {}
                    : {
                        imagePullSecrets: [
                            {
                                name: "docker-hub-regcred"
                            },
                        ]
                    }))
            }
        }
    },
    _a["./k8s/" + HOST_TYPE + "/4.frontend-service.yaml"] = {
        kind: "Service",
        apiVersion: "v1",
        metadata: {
            namespace: PROJECT_NAME + "-" + HOST_TYPE,
            name: PROJECT_NAME + "-frontend-service"
        },
        spec: {
            selector: {
                pod: PROJECT_NAME + "-frontend-container"
            },
            ports: [
                {
                    protocol: "TCP",
                    port: 9090,
                    targetPort: 9090
                },
            ],
            type: "ClusterIP"
        }
    },
    _a["./k8s/" + HOST_TYPE + "/5.backend-service.yaml"] = {
        kind: "Service",
        apiVersion: "v1",
        metadata: {
            namespace: PROJECT_NAME + "-" + HOST_TYPE,
            name: PROJECT_NAME + "-backend-service"
        },
        spec: {
            selector: {
                pod: PROJECT_NAME + "-backend-container"
            },
            ports: [
                {
                    protocol: "TCP",
                    port: 5000,
                    targetPort: 5000
                },
            ],
            type: "ClusterIP"
        }
    },
    _a["./k8s/" + HOST_TYPE + "/6.issuer.yaml"] = {
        apiVersion: "cert-manager.io/v1alpha2",
        kind: "ClusterIssuer",
        metadata: {
            name: "letsencrypt-" + HOST_TYPE,
            namespace: "cert-manager"
        },
        spec: {
            acme: {
                server: HOST_TYPE === "local" /* Local */
                    ? "https://acme-staging-v02.api.letsencrypt.org/directory"
                    : "https://acme-v02.api.letsencrypt.org/directory",
                email: LETSENCRYPT_EMAIL,
                privateKeySecretRef: {
                    name: "letsencrypt-" + HOST_TYPE
                },
                solvers: [
                    {
                        http01: {
                            ingress: {
                                "class": "nginx"
                            }
                        }
                    },
                ]
            }
        }
    },
    _a["./k8s/" + HOST_TYPE + "/7.backend-ingress.yaml"] = {
        apiVersion: "networking.k8s.io/v1",
        kind: "Ingress",
        metadata: {
            namespace: PROJECT_NAME + "-" + HOST_TYPE,
            name: PROJECT_NAME + "-backend-ingress",
            annotations: (_b = {},
                _b["kubernetes.io/ingress.class"] = "public",
                _b["cert-manager.io/cluster-issuer"] = "letsencrypt-" + HOST_TYPE,
                _b["nginx.ingress.kubernetes.io/proxy-read-timeout"] = "1800",
                _b["nginx.ingress.kubernetes.io/proxy-send-timeout"] = "1800",
                _b["nginx.ingress.kubernetes.io/rewrite-target"] = "/api/$2",
                _b["nginx.ingress.kubernetes.io/secure-backends"] = "true",
                _b["nginx.ingress.kubernetes.io/ssl-redirect"] = "true",
                _b["nginx.ingress.kubernetes.io/websocket-services"] = PROJECT_NAME + "-backend-service",
                _b["nginx.org/websocket-services"] = PROJECT_NAME + "-backend-service",
                _b)
        },
        spec: {
            tls: [
                {
                    hosts: [PROJECT_DOMAIN],
                    secretName: "echo-tls"
                },
            ],
            rules: [
                {
                    host: PROJECT_DOMAIN,
                    http: {
                        paths: [
                            {
                                path: PROJECT_BACKEND_INGRESS_PATH,
                                pathType: 'ImplementationSpecific',
                                backend: {
                                    service: { name: PROJECT_NAME + "-backend-service", port: { number: 5000 } }
                                }
                            },
                        ]
                    }
                },
            ]
        }
    },
    _a["./k8s/" + HOST_TYPE + "/8.frontend-ingress.yaml"] = {
        apiVersion: "networking.k8s.io/v1",
        kind: "Ingress",
        metadata: {
            namespace: PROJECT_NAME + "-" + HOST_TYPE,
            name: PROJECT_NAME + "-frontend-ingress",
            annotations: (_c = {},
                _c["kubernetes.io/ingress.class"] = "public",
                _c["cert-manager.io/cluster-issuer"] = "letsencrypt-" + HOST_TYPE,
                _c["nginx.ingress.kubernetes.io/proxy-read-timeout"] = "1800",
                _c["nginx.ingress.kubernetes.io/proxy-send-timeout"] = "1800",
                _c["nginx.ingress.kubernetes.io/rewrite-target"] = PROJECT_FRONTEND_INGRESS_REWRITE_TARGET,
                _c["nginx.ingress.kubernetes.io/secure-backends"] = "true",
                _c["nginx.ingress.kubernetes.io/ssl-redirect"] = "true",
                _c)
        },
        spec: {
            tls: [
                {
                    hosts: [PROJECT_DOMAIN],
                    secretName: "echo-tls"
                },
            ],
            rules: [
                {
                    host: PROJECT_DOMAIN,
                    http: {
                        paths: [
                            {
                                path: PROJECT_FRONTEND_INGRESS_PATH,
                                pathType: 'ImplementationSpecific',
                                backend: {
                                    service: { name: PROJECT_NAME + "-frontend-service", port: { number: 9090 } }
                                }
                            },
                        ]
                    }
                },
            ]
        }
    },
    _a);
var DATABASE_CONFIG = (_d = {},
    _d["./k8s/" + HOST_TYPE + "/postgres/services/global-service.yaml"] = {
        apiVersion: "v1",
        kind: "Service",
        metadata: {
            namespace: "global-postgres-" + HOST_TYPE,
            name: PROJECT_NAME + "-global-postgres",
            labels: {
                app: "postgres"
            }
        },
        spec: {
            type: "NodePort",
            ports: [
                {
                    port: POSTGRES_INTERNAL_PORT,
                    nodePort: POSTGRES_PORT
                },
            ],
            selector: {
                app: "postgres"
            }
        }
    },
    _d["./k8s/" + HOST_TYPE + "/postgres/0.namespace.yaml"] = {
        apiVersion: "v1",
        kind: "Namespace",
        metadata: {
            name: "global-postgres-" + HOST_TYPE
        }
    },
    _d["./k8s/" + HOST_TYPE + "/postgres/1.configmap.yaml"] = {
        apiVersion: "v1",
        kind: "ConfigMap",
        metadata: {
            namespace: "global-postgres-" + HOST_TYPE,
            name: "postgres-config",
            labels: {
                app: "postgres"
            }
        },
        data: {
            POSTGRES_USER: ROOT_POSTGRES_USER,
            POSTGRES_PASSWORD: ROOT_POSTGRES_PASSWORD
        }
    },
    _d["./k8s/" + HOST_TYPE + "/postgres/2.storage.yaml"] = [
        {
            kind: "PersistentVolume",
            apiVersion: "v1",
            metadata: {
                namespace: "global-postgres-" + HOST_TYPE,
                name: "global-postgres-pv-volume",
                labels: {
                    type: "local",
                    app: "postgres"
                }
            },
            spec: {
                storageClassName: "manual",
                capacity: {
                    storage: "20Gi"
                },
                accessModes: ["ReadWriteMany"],
                hostPath: {
                    path: "/mnt/global-postgres-data"
                }
            }
        },
        {
            kind: "PersistentVolumeClaim",
            apiVersion: "v1",
            metadata: {
                namespace: "global-postgres-" + HOST_TYPE,
                name: "global-postgres-pv-claim",
                labels: {
                    app: "postgres"
                }
            },
            spec: {
                storageClassName: "manual",
                accessModes: ["ReadWriteMany"],
                resources: {
                    requests: {
                        storage: "20Gi"
                    }
                }
            }
        },
    ],
    _d["./k8s/" + HOST_TYPE + "/postgres/3.deployment.yaml"] = {
        apiVersion: "apps/v1",
        kind: "Deployment",
        metadata: {
            namespace: "global-postgres-" + HOST_TYPE,
            name: "postgres"
        },
        spec: {
            replicas: 1,
            selector: {
                matchLabels: {
                    pod: "postgres-container"
                }
            },
            template: {
                metadata: {
                    namespace: "global-postgres-" + HOST_TYPE,
                    labels: {
                        app: "postgres",
                        pod: "postgres-container"
                    }
                },
                spec: {
                    containers: [
                        {
                            name: "postgres",
                            image: "postgres:13",
                            imagePullPolicy: "IfNotPresent",
                            ports: [
                                {
                                    containerPort: POSTGRES_INTERNAL_PORT
                                },
                            ],
                            envFrom: [
                                {
                                    configMapRef: {
                                        name: "postgres-config"
                                    }
                                },
                            ],
                            volumeMounts: [
                                {
                                    mountPath: "/var/lib/postgresql/data",
                                    name: "postgredb"
                                },
                            ],
                            resources: {
                                requests: {
                                    memory: "100Mi",
                                    cpu: "200m"
                                },
                                limits: {
                                    memory: "1000Mi",
                                    cpu: "1"
                                }
                            }
                        },
                    ],
                    volumes: [
                        {
                            name: "postgredb",
                            persistentVolumeClaim: {
                                claimName: "global-postgres-pv-claim"
                            }
                        },
                    ]
                }
            }
        }
    },
    _d["./k8s/" + HOST_TYPE + "/postgres/4.service.yaml"] = {
        apiVersion: "v1",
        kind: "Service",
        metadata: {
            namespace: "global-postgres-" + HOST_TYPE,
            name: "postgres",
            labels: {
                app: "postgres"
            }
        },
        spec: {
            selector: {
                app: "postgres"
            },
            ports: [
                {
                    protocol: "TCP",
                    port: POSTGRES_INTERNAL_PORT,
                    targetPort: POSTGRES_INTERNAL_PORT
                },
            ],
            type: "ClusterIP"
        }
    },
    _d);
Object.keys(PROJECT_CONFIG).map(function (file) {
    return fs_1.writeFileSync(file, yaml_1.stringify(PROJECT_CONFIG[file]));
});
Object.keys(DATABASE_CONFIG).map(function (file) {
    return fs_1.writeFileSync(file, Array.isArray(DATABASE_CONFIG[file])
        ? DATABASE_CONFIG[file].map(function (v) { return yaml_1.stringify(v); }).join("---\n")
        : yaml_1.stringify(DATABASE_CONFIG[file]));
});
