APP_NAME=myapp
NAMESPACE=default

doc:
    docker ps

deployA:
    kubectl apply -f .

deploy:
    kubectl apply -f delpoy/ -n $(NAMESPACE)

delete:
    kubectl delete all --all -n $(NAMESPACE)

get:
    kubectl get all -n $(NAMESPACE)

pod:
    kubectl get pods -n $(NAMESPACE)

svc:
    kubectl get svc -n $(NAMESPACE)
