declare const navLinks: {
    id: number;
    name: string;
    type: string;
}[];
declare const navIcons: {
    id: number;
    img: string;
}[];
declare const dockApps: {
    id: string;
    name: string;
    icon: string;
    canOpen: boolean;
}[];
declare const blogPosts: {
    id: number;
    date: string;
    title: string;
    image: string;
    link: string;
}[];
declare const techStack: {
    category: string;
    items: string[];
}[];
declare const socials: {
    id: number;
    text: string;
    icon: string;
    bg: string;
    link: string;
}[];
declare const photosLinks: {
    id: number;
    icon: string;
    title: string;
}[];
export { navLinks, navIcons, dockApps, blogPosts, techStack, socials, photosLinks, };
export declare const locations: {
    work: {
        id: number;
        type: string;
        name: string;
        icon: string;
        kind: string;
        children: {
            id: number;
            name: string;
            icon: string;
            kind: string;
            children: {
                id: number;
                name: string;
                icon: string;
                kind: string;
                fileType: string;
                href: string;
            }[];
        }[];
    };
    about: {
        id: number;
        type: string;
        name: string;
        icon: string;
        kind: string;
        children: ({
            id: number;
            name: string;
            icon: string;
            kind: string;
            fileType: string;
            position: string;
            imageUrl: string;
            subtitle?: undefined;
            image?: undefined;
            description?: undefined;
        } | {
            id: number;
            name: string;
            icon: string;
            kind: string;
            fileType: string;
            position: string;
            subtitle: string;
            image: string;
            description: string[];
            imageUrl?: undefined;
        })[];
    };
    resume: {
        id: number;
        type: string;
        name: string;
        icon: string;
        kind: string;
        children: {
            id: number;
            name: string;
            icon: string;
            kind: string;
            fileType: string;
        }[];
    };
    trash: {
        id: number;
        type: string;
        name: string;
        icon: string;
        kind: string;
        children: {
            id: number;
            name: string;
            icon: string;
            kind: string;
            fileType: string;
            position: string;
            imageUrl: string;
        }[];
    };
};
declare const INITIAL_Z_INDEX = 1000;
declare const WINDOW_CONFIG: {
    finder: {
        isOpen: boolean;
        zIndex: number;
        data: null;
    };
    contact: {
        isOpen: boolean;
        zIndex: number;
        data: null;
    };
    resume: {
        isOpen: boolean;
        zIndex: number;
        data: null;
    };
    safari: {
        isOpen: boolean;
        zIndex: number;
        data: null;
    };
    photos: {
        isOpen: boolean;
        zIndex: number;
        data: null;
    };
    terminal: {
        isOpen: boolean;
        zIndex: number;
        data: null;
    };
    txtfile: {
        isOpen: boolean;
        zIndex: number;
        data: null;
    };
    imgfile: {
        isOpen: boolean;
        zIndex: number;
        data: null;
    };
};
export { INITIAL_Z_INDEX, WINDOW_CONFIG };
