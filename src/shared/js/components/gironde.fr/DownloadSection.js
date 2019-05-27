import React from 'react';

export default function({dataUrl, sourceCodeUrl}){
    return <footer className="w-files" aria-labelledby="w-files-heading">
        <h2 id="w-files-heading" className="w-files__title">Télécharger les données en Open Data</h2>
        <ul className="w-files__links">
            <li>
                <a href={dataUrl} target="_blank" rel="noopener">Données brutes des comptes administratifs (norme comptable M14)</a>
            </li>
            <li>
                <a href={sourceCodeUrl} target="_blank" rel="noopener">Code source de cet outil d'exploration</a>
            </li>
        </ul>
    </footer>;
}
