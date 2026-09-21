import React, { useState } from 'react';
import { UserProfile } from '../types';

export function Avatar({ user }: { user: Pick<UserProfile, 'realName' | 'avatarUrl'> }) {
  const [failedUrl, setFailedUrl] = useState('');
  return user.avatarUrl && user.avatarUrl !== failedUrl
    ? <img src={user.avatarUrl} alt={`${user.realName} 프로필`} className="w-full h-full object-cover rounded-[inherit]" onError={() => setFailedUrl(user.avatarUrl)} />
    : <>{user.realName.slice(-2)}</>;
}
