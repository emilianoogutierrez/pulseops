"use client";
import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";
const initialState: LoginState = {};
export function LoginForm() {
    const [state, action, pending] = useActionState(loginAction, initialState);
    return (<form action={action} className="login-form">
      <label>
        <span>Email</span>
        <input name="email" type="email" autoComplete="email" defaultValue="demo@pulseops.local" required/>
      </label>
      <label>
        <span>Password</span>
        <input name="password" type="password" autoComplete="current-password" required/>
      </label>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      <button className="primary-button login-submit" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>);
}
