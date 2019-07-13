import { Service } from '@griffins/rest-server';
import { routes } from './generated/routes';
import { Context} from "./context";

const service = new Service(new Context());
routes.forEach(r => r(service));
service.startup();
