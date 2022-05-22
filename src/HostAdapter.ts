namespace HostAdapter {
    export interface PingResult {
        min: number;
        avg: number;
        max: number;
        mdev: number;
        percentLoss: number;
    };
    export type PowerOn = () => void;
    export type PowerOff = () => void;
    export type IsUp = () => Promise<boolean>;
    export type Ping = () => Promise<PingResult>;
}

interface HostAdapter {
    powerOn?: HostAdapter.PowerOn;
    powerOff?: HostAdapter.PowerOff;
    isUp?: HostAdapter.IsUp;
    ping?: HostAdapter.Ping;
}

export default HostAdapter;
