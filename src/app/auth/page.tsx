import userService from "@/server/services/user.service";
import UserRegistrationForm from "./register-from";
import UserLoginForm from "./login-from";


export default async function AuthPage() {

    const allUsers = await userService.getAllUsers();
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex gap-4">
                <h2 className="text-3xl font-bold tracking-tight flex-1">Login</h2>

            </div>
            {allUsers.length === 0 ? <UserRegistrationForm /> : <UserLoginForm />}
        </div>
    )
}