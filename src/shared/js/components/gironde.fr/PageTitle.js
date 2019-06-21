import React from 'react';

/*
    This component should be used only one per page
    It uses conventions from the production website
*/

export default function PageTitle ({text}){
    return <h1 className="title--page title--bold">{text}</h1>
}
