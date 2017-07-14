FROM mongo

COPY certs /etc/ssl

CMD ["mongod", "--sslMode", "--sslAllowConnectionsWithoutCertificates", "requireSSL", "--sslPEMKeyFile", "/etc/ssl/mongodb.pem", "--sslCAFile", "/etc/ssl/ca.pem"]
