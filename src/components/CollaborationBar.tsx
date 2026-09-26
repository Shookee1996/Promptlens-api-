import React, { useState } from 'react';
import { Users, Copy, Check, Radio, Sparkles, UserPlus } from 'lucide-react';
import { CollaboratorUser } from '../types';

interface CollaborationBarProps {
  roomId: string;
  isConnected: boolean;
  currentUser: CollaboratorUser;
  collaborators: CollaboratorUser[];
  onRoomChange: (roomId: string) => void;
  onToast: (msg: string, type?: 'ok' | 'err') => void;
}

export const CollaborationBar: React.FC<CollaborationBarProps> = ({
  roomId,
  isConnected,
  currentUser,
  collaborators,
  onRoomChange,
  onToast,
}) => {
  const [showRoomInput, setShowRoomInput] = useState(false);
  const [newRoomId, setNewRoomId] = useState(roomId);

  const copyInviteLink = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    try {
      await navigator.clipboard.writeText(url.toString());
      onToast('Collaboration invite link copied ✓', 'ok');
    } catch {
      onToast('Failed to copy link', 'err');
    }
  };

  const allUsers = [currentUser, ...collaborators.filter((c) => c.id !== currentUser.id)];

  return (
    <div className="max-w-[1480px] mx-auto px-7 py-2 flex items-center justify-between gap-3 flex-wrap bg-[#0c1816]/70 backdrop-blur-md border-y border-[#1a3832] text-xs">
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Connection status */}
        <div className="inline-flex items-center gap-1.5 bg-[#0e1d1a] border border-[#22403a] px-2.5 py-1 rounded-full text-[11px] font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected
                ? 'bg-[#3ddc84] shadow-[0_0_8px_#3ddc84] animate-pulse'
                : 'bg-[#ff6b7a]'
            }`}
          />
          <span className="text-[#cfe6df]">
            {isConnected ? 'Real-Time Sync' : 'Connecting…'}
          </span>
        </div>

        {/* Room badge */}
        <div className="inline-flex items-center gap-1.5 bg-[#122421] border border-[#23423c] px-2.5 py-1 rounded-full text-[11px]">
          <span className="text-[#8faea5]">Room:</span>
          <span className="font-mono text-[#ffb454] font-bold">{roomId}</span>
          <button
            onClick={() => setShowRoomInput(!showRoomInput)}
            className="text-[#37d6c0] hover:underline cursor-pointer ml-1 text-[10px]"
          >
            {showRoomInput ? 'Close' : 'Switch'}
          </button>
        </div>

        {showRoomInput && (
          <div className="inline-flex items-center gap-1 bg-[#0a1614] border border-[#2a4a44] p-1 rounded-xl animate-fadeIn">
            <input
              type="text"
              value={newRoomId}
              onChange={(e) => setNewRoomId(e.target.value)}
              placeholder="Room ID"
              className="bg-transparent text-white font-mono text-[11px] px-2 py-0.5 outline-none w-28"
            />
            <button
              onClick={() => {
                if (newRoomId.trim()) {
                  onRoomChange(newRoomId.trim());
                  setShowRoomInput(false);
                }
              }}
              className="btn-amber px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer"
            >
              Join
            </button>
          </div>
        )}

        <button
          onClick={copyInviteLink}
          className="inline-flex items-center gap-1 text-[#8faea5] hover:text-[#37d6c0] transition-colors cursor-pointer px-2 py-1 rounded-lg border border-transparent hover:border-[#22403a]"
          title="Share room link"
        >
          <UserPlus className="w-3.5 h-3.5 text-[#37d6c0]" />
          <span>Invite</span>
        </button>
      </div>

      {/* Active Collaborators Avatars */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#8faea5] hidden sm:inline">Active Collaborators:</span>
        <div className="flex items-center -space-x-1.5 overflow-hidden">
          {allUsers.map((user) => {
            const isSelf = user.id === currentUser.id;
            const initials = user.name.slice(0, 2).toUpperCase();
            return (
              <div
                key={user.id}
                title={`${user.name} ${isSelf ? '(You)' : ''} — ${user.status}`}
                className="relative group cursor-pointer"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] text-[#0b1514] border-2 border-[#0b1514] shadow-sm transition-transform hover:scale-115 hover:z-20"
                  style={{ backgroundColor: user.color }}
                >
                  {initials}
                </div>
                {/* Status indicator badge */}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0b1514] ${
                    user.status === 'editing'
                      ? 'bg-[#ffb454] animate-ping'
                      : user.status === 'analyzing' || user.status === 'batch'
                      ? 'bg-[#a855f7] animate-pulse'
                      : 'bg-[#3ddc84]'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
