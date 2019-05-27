import React from 'react';

export default function({dataUrl, sourceCodeUrl}){
    return <footer className="w-files" aria-labelledby="w-files-heading">
        <h3 id="w-files-heading" className="w-files__title">Télécharger les données en Open Data</h3>
        <ul className="w-files__links">
            <li>
                <a href={dataUrl} target="_blank" rel="noopener">Comptes administratifs (format XML <code>DocumentBudgetaire</code>)</a>
            </li>
            <li>
                <a href={sourceCodeUrl} target="_blank" rel="noopener">Code source de cet outil d'exploration</a>
            </li>
        </ul>
    </footer>;
}
