export interface AdminLoginCommand {
    username: string,
    password: string
}

export interface CreateSignupCommand {
    requestedBy :string,
    requestedFor:string,
    role:number
 }