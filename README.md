
# Docker
#### Crea el volumen persistente:```docker volume create stripe-cli-config
```
#### Ejecuta stripe login usando el volumen para que guarde tu sesión de autenticación:```docker run -it --rm -v stripe-cli-config:/root/.config/stripe stripe/stripe-cli:latest login```
#### Ejecuta stripe listen con el volumen para mantener la autenticación:```docker run -it --rm -v stripe-cli-config:/root/.config/stripe stripe/stripe-cli:latest listen --forward-to http://host.docker.internal:3003/payments/webhook
```
#### En otra terminal sin cerrar la anterior Para probar eventos, también usa el volumen:```docker run -it --rm -v stripe-cli-config:/root/.config/stripe stripe/stripe-cli:latest trigger payment_intent.succeeded
```