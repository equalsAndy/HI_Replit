import { db } from '../server/db';
import { inviteService } from '../server/services/invite-service';

interface UserInviteData {
  email: string;
  name: string;
  jobTitle?: string;
  organization?: string;
}

const usersToInvite: UserInviteData[] = [
  {
    email: 'schumb@agilesprints.space',
    name: 'Erik Schumb',
    jobTitle: 'Agile Coach',
    organization: ''
  },
  {
    email: 'lejla.bilal@gmail.com',
    name: 'Lejla Bilal',
    jobTitle: 'Senior L & D Exec',
    organization: ''
  },
  {
    email: 'reiscassio@gmail.com',
    name: 'Cassio Reis',
    jobTitle: 'PM Advisor',
    organization: ''
  },
  {
    email: 'viragh.stefan@gmail.com',
    name: 'Stephan Viragh',
    jobTitle: 'Exec CGE',
    organization: 'CGE'
  },
  {
    email: 'marktippin@gmail.com',
    name: 'Mark Tippin',
    jobTitle: 'Director Strategic Next Services',
    organization: 'MURAL'
  },
  {
    email: 'rachel.masika@ntlworld.com',
    name: 'Rachel Masika',
    jobTitle: 'HI Senior Advisor International Education Innovation & Development',
    organization: 'Heliotrope Imaginal'
  },
  {
    email: 'gotfrit@sfu.ca',
    name: 'Martin Gotfrit',
    jobTitle: 'HI Principle Investor',
    organization: 'Heliotrope Imaginal'
  },
  {
    email: 'ujlookerj@algonquincollege.com',
    name: 'Jed Looker',
    jobTitle: 'Director Human Centered Design Lab',
    organization: 'Algonquin'
  }
];

async function createBatchInvites() {
  console.log('\n🎫 Creating invites for AST Workshop\n');
  console.log('Parameters:');
  console.log('- Role: participant');
  console.log('- Created By: User 36');
  console.log('- Beta Tester: Yes');
  console.log('- Workshop: AST (AllStarTeams)');
  console.log('- Cohort: None\n');
  console.log('─'.repeat(80));

  const results: Array<{
    email: string;
    name: string;
    inviteCode?: string;
    error?: string;
  }> = [];

  for (const user of usersToInvite) {
    try {
      console.log(`\nCreating invite for: ${user.name} (${user.email})`);

      const result = await inviteService.createInviteWithAssignment({
        email: user.email.toLowerCase(),
        name: user.name,
        role: 'participant',
        createdBy: 36,
        isBetaTester: true,
        cohortId: null,
        organizationId: null,
        expiresAt: null,
        // Note: The invite service may not support jobTitle/organization fields directly
        // These might need to be added separately or the service updated
      });

      if (!result.success) {
        throw new Error(result.error || 'Unknown error creating invite');
      }

      // Format invite code with hyphens for display
      const formattedCode = result.invite.formattedCode ||
                           inviteService.formatInviteCode(result.invite.invite_code);

      console.log(`✅ Success! Invite code: ${formattedCode}`);
      if (user.jobTitle) console.log(`   Job Title: ${user.jobTitle}`);
      if (user.organization) console.log(`   Organization: ${user.organization}`);

      results.push({
        email: user.email,
        name: user.name,
        inviteCode: formattedCode
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed for ${user.name}: ${errorMessage}`);

      results.push({
        email: user.email,
        name: user.name,
        error: errorMessage
      });
    }
  }

  // Summary
  console.log('\n' + '─'.repeat(80));
  console.log('\n📊 SUMMARY\n');

  const successful = results.filter(r => r.inviteCode);
  const failed = results.filter(r => r.error);

  console.log(`Total Processed: ${results.length}`);
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}\n`);

  if (successful.length > 0) {
    console.log('✅ SUCCESSFUL INVITES:\n');
    successful.forEach(result => {
      console.log(`${result.name}`);
      console.log(`   Email: ${result.email}`);
      console.log(`   Code:  ${result.inviteCode}\n`);
    });
  }

  if (failed.length > 0) {
    console.log('❌ FAILED INVITES:\n');
    failed.forEach(result => {
      console.log(`${result.name} (${result.email})`);
      console.log(`   Error: ${result.error}\n`);
    });
  }

  console.log('─'.repeat(80));
  console.log('\n✨ Batch invite creation complete!\n');
}

// Run the script
createBatchInvites()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
