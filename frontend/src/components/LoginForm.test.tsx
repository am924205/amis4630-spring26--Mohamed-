import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "./LoginForm";
import { AuthProvider } from "../context/AuthContext";

jest.mock("react-router-dom", () => ({
  Link: ({ to, children, ...rest }: any) => <a href={typeof to === "string" ? to : "#"} {...rest}>{children}</a>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: "/", state: null }),
}));

describe("<LoginForm />", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders the log in heading and fields", () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );
    expect(screen.getByRole("heading", { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test("shows validation errors when submitted empty", async () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );

    userEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  test("shows email format error when email is invalid", async () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );

    userEvent.type(screen.getByLabelText(/email/i), "not-an-email");
    userEvent.type(screen.getByLabelText(/password/i), "anything");
    userEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
  });
});
