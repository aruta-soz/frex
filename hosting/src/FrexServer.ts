import express from 'express';
import http from 'http';
import type { Express } from 'express';
import { existsSync, fstat, fstatSync } from 'fs';

export default class FrexServer {
    protected app: Express;
    protected httpServer: http.Server | null;

    protected subdomains: {
        [name: string]: {
            app: Express;
            port: number;
        };
    };

    constructor() {
        this.app = express();
        this.httpServer = null;
        this.subdomains = {};
    }

    public start(port: number = 3000): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.httpServer !== null) {
                reject(new Error('Http server already started'));
                return;
            }

            this.httpServer = this.app.listen(port, () => {
                console.log(`App listening on port ${port}`);

                resolve();
            });
        });
    }

    public stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.httpServer === null) {
                reject(new Error('Http server not started'));
                return;
            }

            this.httpServer.close((err?: Error) => {
                this.httpServer = null;

                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        });
    }

    // FrexServer is compatible with:
    // - React
    // - Vuepress
    //
    // It's hardcoded for now. It's a POC
    public declareDomainBufferVersionFile({
        directory,
        domainName,
        bufferVersion,
        serverDomain,
    }: {
        directory: string;
        domainName: string;
        bufferVersion: number;
        serverDomain: string;
    }) {
        const domainAndVersion = `${domainName}-${bufferVersion}`;

        // Already served
        if (this.subdomains[domainAndVersion]) {
            return;
        }

        const subdomainExpress = express();
        const port = 3001 + Object.keys(this.subdomains).length;

        subdomainExpress.listen(port, () => {
            console.log(`Subdomain ${domainAndVersion} server listening on port ${port}`);
        });

        console.log(`Serving ${directory}/${domainAndVersion}/ in their own subdomain server on port ${port} ...`);

        if (existsSync(`${directory}/${domainAndVersion}/docs/.vuepress`)) {
            //
            // We have a vuepress project
            //
            subdomainExpress.use(express.static(`${directory}/${domainAndVersion}/docs/.vuepress/dist/`));

            subdomainExpress.get('/', (req, res) => {
                res.sendFile(`${directory}/${domainAndVersion}/docs/.vuepress/dist/index.html`)
            });
        } else if (existsSync(`${directory}/${domainAndVersion}/build/index.html`)) {
            //
            // We have a react project
            //
            subdomainExpress.use(express.static(`${directory}/${domainAndVersion}/build`))

            subdomainExpress.get('/', (req, res) => {
                res.sendFile(`${directory}/${domainAndVersion}/build/index.html`)
            });
        } else {
            //
            // We don't know, so we render at root
            //
            subdomainExpress.use(express.static(`${directory}/${domainAndVersion}`))

            subdomainExpress.get('/', (req, res) => {
                res.sendFile(`${directory}/${domainAndVersion}`)
            });
        }

        // Redirect subdomain requests on main server to subdomain server
        this.app.get(`/${domainAndVersion}`, (req, res) => {
            // Redirect to the proper server
            res.writeHead(302, {
                Location: `${serverDomain}:${port}`,
            });

            res.end();
        });

        this.subdomains[domainAndVersion] = {
            app: subdomainExpress,
            port,
        };
    }
}