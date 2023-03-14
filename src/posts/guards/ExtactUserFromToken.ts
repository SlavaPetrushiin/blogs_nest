import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

function initUser(id: null | string, login: null | string) {
    return { id, login };
}

@Injectable()
export class ExtactUserFromToken implements CanActivate {
    constructor(
        private readonly jwtService: JwtService
    ) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const auth = request.headers.authorization;

        if (!auth) {
            request.user = initUser(null, null);
            return true;
        }

        const authType = auth.split(' ')[0];
        if (authType !== 'Bearer') {
            request.user = initUser(null, null);
            return true;
        }

        const accessToken = auth.split(' ')[1];
        if (!accessToken) {
            request.user = initUser(null, null);
            return true;
        }

        const payload: any = this.jwtService.decode(accessToken);
        if (!payload) {
            request.user = initUser(null, null);
            return true;
        }

        request.user = initUser(payload.id, payload.login);
        return true;
    }
}