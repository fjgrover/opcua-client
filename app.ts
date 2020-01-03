import {
    OPCUAClient,
    MessageSecurityMode,
    SecurityPolicy,
} from 'node-opcua';

const connectionStrategy = {
    initialDelay: 1000,
    maxRetry: 2
};

const options = {
    applicationName: "Opcua-Client",
    connectionStrategy: connectionStrategy,
    securityMode: MessageSecurityMode.None,
    securityPolicy: SecurityPolicy.None,
    endpoint_must_exist: false,
};

const client = OPCUAClient.create( options );
const endpointUrl = "opc.tcp://192.168.5.99:4840";

async function main() {
	
	async function timeout( ms: number ) {
		return new Promise( resolve => setTimeout( resolve, ms ) );
    };

    try {
        await client.connect( endpointUrl );
        console.log( "connected" );

        const session = await client.createSession();
        console.log( "session created" );
    } catch (err) {
        console.log(err);
    }
}

main();