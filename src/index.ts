import * as fs from 'fs';
import Host from "./Host";
import HostAdapter from './HostAdapter';
import hostAdapterFactory from './hostAdapterFactory';

function assertFulfilled<T>(item: PromiseSettledResult<T>): item is PromiseFulfilledResult<T> {
    return item.status === 'fulfilled';
 }

async function readHostsConfig() {
    const hosts: Host[] = JSON.parse(fs.readFileSync(__dirname + "/../hosts.json", "utf8"));
    return hosts;
}

type ScanResult =  [Host, HostAdapter.PingResult | undefined];
type ScanResults = ScanResult[];

interface HostStats extends Host {
    pingResult?: HostAdapter.PingResult,
    reachable: boolean,
}

async function scan(host: Host): Promise<ScanResult> {
    console.log(`Scanning ${host.identifier}`);
    let pingResult: HostAdapter.PingResult | undefined;
    const adapter = hostAdapterFactory(host);
    if(adapter.ping !== undefined) {
        try {
            pingResult = await adapter.ping();
            console.log(`Scanned ${host.identifier}`);
        } catch (error) {
            // ignore
            console.log(`Scan failed for ${host.identifier}`);
        }
    }
    return [host, pingResult];
}

async function scanHosts(hosts: Host[]): Promise<ScanResults> {
    const promises: Promise<ScanResult>[] = hosts.map(h => scan(h));
    const scanResults = await Promise.allSettled<ScanResult>(promises);
    return scanResults.filter(assertFulfilled).map(psr => psr.value);
}

async function main() {
    const hosts: Host[] = await readHostsConfig();
    const scanResult: ScanResults = await scanHosts(hosts);
    console.table(scanResult.map(sr => ({
        ...(sr[0]),
        pingResult: (sr[1]) !== undefined ? (sr[1]).avg : Infinity,
        reachable: (sr[1]) !== undefined && (sr[1]).percentLoss < 100 ? true : false,
    })));
}

main();