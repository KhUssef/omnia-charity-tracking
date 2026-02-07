import { UserRole } from "src/user/entities/user.entity";

export interface JwtPayload {
  username: string;
  sub: number;
  role: UserRole;
}
