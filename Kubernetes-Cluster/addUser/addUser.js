// Future Work: Dynamic Sign-Up Function (In Developing Process)

import express from 'express';
import pkg from '@kubernetes/client-node';

const { KubeConfig, RbacAuthorizationV1Api } = pkg;

const app = express();
const port = 3005;

app.use(express.json()); // Parse JSON bodies

// Load kubeconfig file
const kubeConfig = new KubeConfig();
kubeConfig.loadFromDefault();

// Create an instance of the RbacAuthorizationV1Api
const rbacApi = kubeConfig.makeApiClient(RbacAuthorizationV1Api);

// Endpoint to add user and bind role
app.post('/addUserToRole', async (req, res) => {
    const { userGmail, role } = req.body;

    // Validate input
    if (!userGmail || !role) {
        return res.status(400).json({ error: 'Invalid request. Please provide userGmail and role.' });
    }

    try {
        // Create the role binding
        const binding = {
            apiVersion: 'rbac.authorization.k8s.io/v1',
            kind: 'RoleBinding',
            metadata: {
                name: `${role}-binding-${userGmail}`, // Unique name for the binding
                namespace: 'default' // Adjust the namespace as needed
            },
            subjects: [
                {
                    kind: 'User',
                    name: userGmail, // Using the Gmail as the username
                }
            ],
            roleRef: {
                apiGroup: 'rbac.authorization.k8s.io',
                kind: 'Role',
                name: role // The name of the existing role to bind
            }
        };

        // Create the role binding
        await rbacApi.createNamespacedRoleBinding('default', binding);

        res.json({ message: 'User added and role binding successful.' });
    } catch (error) {
        console.error('Error adding user and binding role:', error);
        res.status(500).json({ error: 'An error occurred while adding user and binding role.' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
