import {
    OPCUAClient,
    MessageSecurityMode,
    SecurityPolicy,
    AttributeIds,
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

        const nodesToRead = [];
        const deviceVars = new Array();
        const browse = "ns=4;s=|var|p500.Application.NETWORK";
        
        const workingDir = await session.browse( browse );
        workingDir.references.forEach( async element => {
            deviceVars.push( { Name: element.displayName.text } );
            nodesToRead.push( { nodeId: element.nodeId.toString(), attributeId: AttributeIds.Value } );
        });

        while ( true ) {
            const dataValue =  await session.readVariableValue( nodesToRead );

            for ( var i = 0; i < nodesToRead.length; i++ ) {
                deviceVars[ i ].Value = dataValue[ i ].value.value;
            }
            
            // console.log( deviceVars );
            const json = JSON.stringify( deviceVars );
            console.log( json );
            
            await timeout( 5000 );
        }
    } catch ( err ) {
        console.log( err );
        await client.disconnect();
    }
}

main();