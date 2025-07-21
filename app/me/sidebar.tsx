import Link from "next/link";

// Define a more specific User type for props
interface User {
    username: string;
    images?: string; // images can be optional
}

interface SidebarProps {
    user: User;
}

export default function Sidebar({ user }: SidebarProps) {
    const menuItems = [
        { href: "/me/list", label: "My Posts" },
        { href: "/me/list/add", label: "Add New Post" },
        { href: "/me/settings", label: "Settings" },
        { href: "/me/chat", label: "Chat" },
    ];

    return (
        <aside className="w-64 bg-gray-100 p-6">
            <div className="text-center mb-8">
                <img
                    src={user.images || 'https://via.placeholder.com/150'}
                    alt={user.username}
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                />
                <h2 className="text-xl font-semibold">{user.username}</h2>
            </div>
            <nav>
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.href} className="mb-4">
                            <Link href={item.href} className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}