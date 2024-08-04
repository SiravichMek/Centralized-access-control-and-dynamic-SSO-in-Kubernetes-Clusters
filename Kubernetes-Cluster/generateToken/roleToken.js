// Fuction for creating the Role JSON

import express from 'express';
import pkg from '@kubernetes/client-node';
const { KubeConfig, CoreV1Api } = pkg;


const app = express();
const port = 3008;

app.use(express.json()); // Parse JSON bodies

// Load kubeconfig file
const kubeConfig = new KubeConfig();
kubeConfig.loadFromDefault();

// Create an instance of the CoreV1Api
const k8sCoreV1Api = kubeConfig.makeApiClient(CoreV1Api);

async function getEndpoints(podName) {
    try {
        // Fetching pod information
        const response = await k8sCoreV1Api.readNamespacedPod(podName, 'default');
        const pod = response.body;
        const podIP = pod.status.podIP;

        // Fetching service information to get NodePort for randomtext-service
        const podResponse = await k8sCoreV1Api.readNamespacedPod(podName, 'default');
        const podLabels = podResponse.body.metadata.labels.app;
        const serviceResponse = await k8sCoreV1Api.readNamespacedService(podLabels, 'default');
        const service = serviceResponse.body;
        console.log(service)

        // Extracting the NodePort for randomtext-service
        const nodePort = service.spec.ports.find(port => port.port === 80)?.nodePort;

        // Fetching external IP address of nodes
        const nodesResponse = await k8sCoreV1Api.listNode();
        const node = nodesResponse.body.items[0]; // Assuming there's only one node for simplicity
        const nodeExternalIP = node.status.addresses.find(address => address.type === 'ExternalIP').address;

        if (!nodePort) {
            console.error('NodePort not found for service randomtext-service');
            return null;
        }

        // Constructing the endpoint using NodePort
        const endpoint = `http://172.20.10.3:${nodePort}`;
        return endpoint;
    } catch (error) {
        console.error('Error fetching endpoints:', error);
        return null;
    }
}




// Function to generate token
async function generateToken(userGmail, podList) {
    const token = {
        userGmail: userGmail,
        pods: {}
    };

    // Get endpoints for each pod
    for (const podName of podList) {
        const endpoint = await getEndpoints(podName);
        if (endpoint) {
            token.pods[podName] = endpoint;
        }
    }

    return token;
}

// Endpoint to generate and send token
app.post('/generateToken', async (req, res) => {
    const { data } = req.body;

    // Validate input
    if (!data || !data.userGmail || !Array.isArray(data.podList)) {
        return res.status(400).json({ error: 'Invalid request. Please provide userGmail and podList.' });
    }

    // Generate token
    const token = await generateToken(data.userGmail, data.podList);

    // Send token as response
    res.json({ token: token });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});