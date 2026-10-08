import assert from 'node:assert/strict';
import test from 'node:test';
import { Post, SocialAccount } from '../types';
import {
  createPostDestination,
  detachSocialAccount,
  hydratePostDestinations,
  syncPostDestinations,
} from './postDestinations';

const accounts: SocialAccount[] = [
  { id:'ig', workspaceId:'w', platform:'instagram', username:'@studio', displayName:'Studio IG', status:'connected', connectionMode:'demo', lastSync:'' },
  { id:'yt', workspaceId:'w', platform:'youtube', username:'@studio', displayName:'Studio YT', status:'connected', connectionMode:'demo', lastSync:'' },
  { id:'other', workspaceId:'other-w', platform:'tiktok', username:'other', displayName:'Other', status:'connected', connectionMode:'demo', lastSync:'' },
];
const basePost: Post = {
  id:'post-a', workspaceId:'w', title:'Post A', destinationAccountIds:['ig','yt'],
  originalContent:{caption:'Hello',mediaIds:[]}, platformContent:[],
  status:'scheduled', scheduledAt:'2026-10-09T12:00:00Z', createdAt:'2026-10-08T12:00:00Z',
};

test('one independent destination record per selected matching account', () => {
  const rows=syncPostDestinations([],basePost,accounts);
  assert.equal(rows.length,2);
  assert.deepEqual(rows.map(d=>d.platform).sort(),['instagram','youtube']);
  assert.ok(rows.every(d=>d.scheduledAt===basePost.scheduledAt));
  assert.ok(rows.every(d=>d.connectionMode==='demo'));
});

test('unowned destinations cannot be added via a forged post account ID', () => {
  const rows=syncPostDestinations([], {...basePost,destinationAccountIds:['ig','other']}, accounts);
  assert.deepEqual(rows.map(d=>d.socialAccountId),['ig']);
});

test('removing an account preserves a published snapshot but detaches its identity', () => {
  const original=createPostDestination({
    ...basePost,status:'published',publishedAt:'2026-10-09T13:00:00Z',
  },accounts[0]);
  const after=detachSocialAccount([original],'ig');
  assert.equal(after.length,1);
  assert.equal(after[0].status,'published');
  assert.equal(after[0].socialAccountId,undefined);
  assert.equal(after[0].platform,'instagram');
  assert.equal(after[0].accountLabel,'Studio IG');
  assert.equal(after[0].publishedAt,'2026-10-09T13:00:00Z');
});

test('removing an account makes pending destination require review', () => {
  const before=syncPostDestinations([],basePost,accounts);
  const after=detachSocialAccount(before,'ig');
  const instagram=after.find(d=>d.platform==='instagram');
  const youtube=after.find(d=>d.platform==='youtube');
  assert.equal(instagram?.socialAccountId,undefined);
  assert.equal(instagram?.status,'needs_review');
  assert.equal(instagram?.scheduledAt,undefined);
  assert.equal(youtube?.status,'scheduled');
  assert.equal(youtube?.scheduledAt,basePost.scheduledAt);
});

test('editing selected destinations never deletes published historical records', () => {
  const published=createPostDestination({
    ...basePost,status:'published',publishedAt:'2026-10-09T13:00:00Z',
  },accounts[0]);
  const changed=syncPostDestinations([published],{
    ...basePost,destinationAccountIds:['yt'],status:'draft',scheduledAt:undefined,
  },accounts);
  assert.equal(changed.length,2);
  assert.equal(changed.find(d=>d.platform==='instagram')?.status,'published');
  assert.equal(changed.find(d=>d.platform==='youtube')?.status,'draft');
});

test('hydration builds missing legacy rows and drops workspace-forged data', () => {
  const seeded=hydratePostDestinations([basePost],accounts,[
    {id:'forged',workspaceId:'other-w',postId:basePost.id,platform:'instagram',accountLabel:'Bad',accountHandle:'bad',connectionMode:'oauth',status:'published'},
  ]);
  assert.equal(seeded.length,2);
  assert.ok(seeded.every(d=>d.workspaceId==='w'));
  assert.ok(seeded.every(d=>d.id!=='forged'));
});

test('hydration retains removed-account historical labels after reload', () => {
  const publishedPost={...basePost,status:'published' as const,publishedAt:'2026-10-09T13:00:00Z',destinationAccountIds:[]};
  const archived=detachSocialAccount([createPostDestination(publishedPost,accounts[0])],'ig');
  const rows=hydratePostDestinations([publishedPost],[],archived);
  assert.deepEqual(rows,archived);
});
