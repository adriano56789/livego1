import * as FrameIcons from '../components/icons/frames';

export const CURRENT_USER_ID = 'me';

export const getRemainingDays = (expirationDate?: string | null) => 0;

export const getFrameGlowClass = (frameId?: string | null) => {
    if (!frameId) return '';
    return 'drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]';
};

export const avatarFrames = [
    { id: 'FrameBlazingSun', name: 'Sol Escaldante', price: 500, duration: 30, component: FrameIcons.FrameBlazingSunIcon },
    { id: 'FrameBlueCrystal', name: 'Cristal Azul', price: 300, duration: 30, component: FrameIcons.FrameBlueCrystalIcon },
    { id: 'FrameBlueFire', name: 'Fogo Azul', price: 600, duration: 30, component: FrameIcons.FrameBlueFireIcon },
    { id: 'FrameDiamond', name: 'Diamante', price: 1000, duration: 30, component: FrameIcons.FrameDiamondIcon }
];

export const db_frontend_stub = {
    liveSessions: new Map<string, any>()
};