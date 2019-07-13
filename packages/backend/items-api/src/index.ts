import { Service } from '@griffins/rest-server';
import { routers } from './generated/routes';
import { Context } from './context';

const service = new Service(new Context());
routers.forEach(r => r.apply(service));
service.startup();
