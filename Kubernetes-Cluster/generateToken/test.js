import pkg from '@kubernetes/client-node';
const { KubeConfig, CoreV1Api } = pkg;

// Load kubeconfig file
const kubeConfig = new KubeConfig();
kubeConfig.loadFromDefault();

// Create an instance of the CoreV1Api
const k8sCoreV1Api = kubeConfig.makeApiClient(CoreV1Api);

async function getServiceForPod(podName, namespace) {
    try {
        // Fetch pod information
        const podResponse = await k8sCoreV1Api.readNamespacedPod(podName, namespace);
        const podLabels = podResponse.body.metadata.labels.app;
        console.log("Pod Labels:", podLabels);

        // Fetch services in the same namespace
        const servicesResponse = await k8sCoreV1Api.listNamespacedService(namespace);
        const services = servicesResponse.body.items.map(service => service.metadata);
        console.log("Services in Namespace:", services);//services[0].name

        // Find the service that matches the pod's name
        const matchingService = ''
        var i = 0;
        while (true){
            if(services[i].name == podLabels){
                console.log("Matching Service:", matchingService);
                i = 0;
                break;
            }
            else{
                i+=1;
            }
            
        }

        return matchingService;
    } catch (error) {
        console.error('Error fetching service for pod:', error);
        return null;
    }
}

const xx = await getServiceForPod('randomtext-service-6d48f5c574-4m2l8', 'default');
console.log(xx);
