interface Host {
    identifier: string;
    ipAddress: string;
    macAddress: string;
    wakeOnLanAvailable: string;
    vmHostedBy?: string;
}

namespace Host {
    export type Identifier = string;
}

export default Host;