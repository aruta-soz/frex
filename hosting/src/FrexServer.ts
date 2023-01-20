import express from 'express';
import http from 'http';
import type { Express } from 'express';

export default class FrexServer {
    protected app: Express;
    protected httpServer: http.Server | null;

    // List the path already served to avoid serving twice the same
    protected servedPaths: {
        [hash: string]: boolean;
    };

    constructor() {
        this.app = express();
        this.httpServer = null;
        this.servedPaths = {};
        /*
        this.app.get('/', (req, res) => {
            console.log('No path');
        });
        */
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

    // All files are considered to have a build/ directory
    // and an index.html file
    //
    // It's super hardcoded for now. It's a POC
    public declareDomainBufferVersionFile({
        directory,
        domainName,
        bufferVersion,
    }: {
        directory: string;
        domainName: string;
        bufferVersion: number;
    }) {
        const domainAndVersion = `${domainName}-${bufferVersion}`;

        // Already served
        if (this.servedPaths[domainAndVersion]) {
            return;
        }

        console.log(`Serving ${directory}/${domainAndVersion}/ ...`);

        this.app.use(express.static(`${directory}/${domainAndVersion}/build`))

        this.app.get(`/${domainAndVersion}`, (req, res) => {
            res.sendFile(`${directory}/${domainAndVersion}/build/index.html`)
        });

        this.servedPaths[domainAndVersion] = true;
    }
}