import type { IArtist } from "../../types/spotify";

export interface ICardArtistProps {
    artist: IArtist;
    rank?: number | null;
    onClick?: () => void;
    showButton?: boolean;
    buttonText?: string;
}
