export interface IUser {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: string
    affiliateCode: string;
    sponsorCode: string;
    permissions?: {
        _id: string
        name: string
        apiPath: string
        module: string
    } []
    license: string
    tokens: string[]
    licenseInfo: {
        daysLeft: number,
        product: string,
    }
}