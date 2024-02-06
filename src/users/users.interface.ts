export interface IUser {
    _id: string;
    name: string;
    email: string;
    role: string
    permissions?: {
        _id: string
        name: string
        apiPath: string
        module: string
    } []
    license: string
    tokens: string[]
}