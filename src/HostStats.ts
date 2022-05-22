import Host from './Host';
import HostAdapter from './HostAdapter';

interface HostStats extends Host {
    pingResult?: HostAdapter.PingResult;
    reachable?: boolean;
}

export default HostStats;