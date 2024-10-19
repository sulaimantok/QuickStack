import userService from "@/server/services/user.service";
import UserRegistrationForm from "./register-from";
import UserLoginForm from "./login-from";
import { getUserSession } from "@/server/utils/action-wrapper.utils";
import { redirect } from "next/navigation";

export default async function AuthPage() {
    const session = await getUserSession();
    if (session) {
        redirect('/');
    }
    const allUsers = await userService.getAllUsers();
    return (
        <div className="flex items-center justify-center" style={{ height: '95vh' }}>
            {allUsers.length === 0 ? <UserRegistrationForm /> : <UserLoginForm />}
        </div>
    )
}