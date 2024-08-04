// Function for retrieving the user's role and the pod avaliable endpoint.

import pkg from '@kubernetes/client-node';
const { KubeConfig, CoreV1Api, RbacAuthorizationV1Api } = pkg;
import express from 'express';

// Load kubeconfig file
const kubeConfig = new KubeConfig();
kubeConfig.loadFromDefault();

const app = express();
const port = 3002;

app.use(express.json());

// Set the current context
const rbacApi = kubeConfig.makeApiClient(RbacAuthorizationV1Api);
const coreApi = kubeConfig.makeApiClient(CoreV1Api);

async function matchPodsWithRoles(userEmail) {
    try {
        // Fetch all RoleBindings in the default namespace
        const response = await rbacApi.listNamespacedRoleBinding('default');
        const bindings = response.body.items;

        // Initialize an object to store associations between users and pods
        const userPodMap = {};

        // Iterate over each RoleBinding
        for (const binding of bindings) {
            const roleName = binding.roleRef.name;

            // Extract the usernames from the subjects
            const userSubjects = binding.subjects.filter(subject => subject.kind === 'User');
            userSubjects.forEach(userSubject => {
                const user = userSubject.name;

                // Fetch all pods associated with the roleName
                const podName = roleName.replace('-reader', ''); // Extract pod name from roleName
                if (user === userEmail) {
                    if (!userPodMap[userEmail]) {
                        userPodMap[userEmail] = [];
                    }
                    userPodMap[userEmail].push(podName);
                }
            });
        }

        // Output the userGmail and associated podList as JSON
        const userPacked = userPodMap[userEmail] || [];
        console.log(JSON.stringify({ "userGmail": userEmail, "podList": userPacked }));
        return { "userGmail": userEmail, "podList": userPacked }
    } catch (error) {
        console.error('Error matching pods with roles:', error);
        throw error;
    }
}

// Endpoint to send available pod data
app.post('/getPod', async (req, res) => {
    const { userGmail } = req.body;

    try {
        // Generate token
        const data = await matchPodsWithRoles(userGmail);
        console.log(data);

        // Send token as response
        res.json({ data: data });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
