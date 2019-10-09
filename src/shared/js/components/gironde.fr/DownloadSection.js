import React from 'react';

import DownloadIcon from '../../../../../images/icons/download.svg';

export default function({dataUrl, reportsUrl, sourceCodeUrl}){
    const nbsp = '\u00A0';

    return <footer className="w-files" aria-labelledby="w-files-heading">
        <h3 id="w-files-heading" className="w-files__title">Logiciel{nbsp}libre et données{nbsp}ouvertes</h3>

        <p>
            Les informations affichées sont les données comptables du{' '}
            <a href={reportsUrl} target="_blank" rel="noopener">compte{nbsp}administratif</a>.
            Ces données sont transmises à la{nbsp}
            <a href="https://www.collectivites-locales.gouv.fr/" target="_blank" rel="noopener">Direction{nbsp}générale des collectivités{nbsp}locales</a>
            {nbsp}(DGCL), et elles sont votées annuellement au Conseil Municipal.
        </p>

        <ul className="w-files__links">
            <li>
                <a href={dataUrl} target="_blank" rel="noopener">
                    <DownloadIcon className="icon" />
                    Accéder aux données d&apos;origine
                </a>
            </li>
            <li>
                <a href={reportsUrl} target="_blank" rel="noopener">
                    <DownloadIcon className="icon" />
                    Lire les rapports annuels
                </a>
            </li>
        </ul>

        <p>
            Le code source de cette visualisation interactive est <strong>libre et ouvert</strong> ;
            libre de réutilisation (dans une autre collectivité) et ouvert
            aux contributions, remarques et adaptations.
        </p>

        <ul className="w-files__links">
            <li>
                <a href={sourceCodeUrl} target="_blank" rel="noopener">
                    <DownloadIcon className="icon" />
                    Code source de cet outil d&apos;exploration
                </a>
            </li>
        </ul>
    </footer>;
}
