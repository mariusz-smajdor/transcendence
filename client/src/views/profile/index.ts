import { ProfileModal } from '../../components/profile-modal';

export default function Profile(options?: { pushState?: boolean }) {
	return ProfileModal({ mode: 'self', pushState: options?.pushState });
}
