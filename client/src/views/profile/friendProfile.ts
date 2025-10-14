import { ProfileModal } from '../../components/profile-modal';

export default function FriendProfile(
	friendId: number,
	options?: { pushState?: boolean }
) {
	return ProfileModal({
		mode: 'friend',
		friendId,
		pushState: options?.pushState,
	});
}
