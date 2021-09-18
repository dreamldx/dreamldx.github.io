# dreamldx.github.io

# Install Kubernetes
1. swapoff -a
2. sudo kubeadm init --apiserver-advertise-address=10.0.100.2 --apiserver-cert-extra-sans=127.0.0.1 --pod-network-cidr=10.1.0.0/16
# Install Calico
1. https://docs.projectcalico.org/getting-started/kubernetes/quickstart
