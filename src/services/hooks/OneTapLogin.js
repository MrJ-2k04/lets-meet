import React from 'react';
import GoogleOneTapLogin from 'react-google-one-tap-login';

const clientId = process.env.REACT_APP_CLIENT_ID;

function OneTapLogin() {
    return (
        <GoogleOneTapLogin 
            onError={(error) => console.log(error)} 
            onSuccess={(response) => console.log(response)}
            googleAccountConfigs={{
                client_id: clientId,
            }} 
        />
     );
}

export default OneTapLogin
