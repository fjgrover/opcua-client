import {
    OPCUAClient,
    MessageSecurityMode,
    SecurityPolicy,
    AttributeIds,
} from 'node-opcua';

const axios = require( 'axios' );
require( 'dotenv' ).config();

const connectionStrategy = {
    initialDelay: 1000,
    maxRetry: 2
};

const options = {
    applicationName: 'OPCUA-Client',
    connectionStrategy: connectionStrategy,
    securityMode: MessageSecurityMode.None,
    securityPolicy: SecurityPolicy.None,
    endpoint_must_exist: false,
};

const client = OPCUAClient.create( options );
const endpointUrl = process.env.ENDPOINT_URL;

async function main() {

    async function timeout( ms: number ) {
		return new Promise( resolve => setTimeout( resolve, ms ) );
    };

    try {
        await client.connect( endpointUrl );
        console.log( 'connected' );

        const session = await client.createSession();
        console.log( 'session created' );

        const nodesToRead = [];
        const deviceVars = new Array();
        
        const workingDir = await session.browse( process.env.VARIABLE_PATH );
        workingDir.references.forEach( async element => {
            deviceVars.push( { Name: element.displayName.text } );
            nodesToRead.push( { nodeId: element.nodeId.toString(), attributeId: AttributeIds.Value } );
        });

        const instance = axios.create( {
            baseURL: process.env.SERVER_URL
        });

        while ( true ) {
            const dataValue =  await session.readVariableValue( nodesToRead );

            for ( var i = 0; i < nodesToRead.length; i++ ) {
                deviceVars[ i ].Value = dataValue[ i ].value.value;
            }
            
            const json = JSON.stringify( deviceVars );
            console.log( json );
            instance.post( json );
            
            await timeout( parseInt( process.env.TIMEOUT_MS ) );
        }
    } catch ( err ) {
        console.log( err );
    } finally {
        await client.disconnect();
    }
}

main();