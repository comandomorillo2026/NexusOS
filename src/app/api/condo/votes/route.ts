import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch votes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status');
    const voteId = searchParams.get('voteId');
    const residentId = searchParams.get('residentId');

    if (voteId) {
      // Get single vote with results
      const vote = await db.condoVote.findFirst({
        where: { id: voteId },
        include: {
          responses: residentId ? {
            where: { residentId }
          } : true
        }
      });

      // Calculate results if vote exists
      let results = null;
      if (vote && vote.responses.length > 0) {
        const options = JSON.parse(vote.options);
        const responseCounts: Record<string, number> = {};
        
        vote.responses.forEach(r => {
          const response = JSON.parse(r.response);
          if (Array.isArray(response)) {
            response.forEach((optId: string) => {
              responseCounts[optId] = (responseCounts[optId] || 0) + 1;
            });
          } else {
            responseCounts[response] = (responseCounts[response] || 0) + 1;
          }
        });

        results = options.map((opt: { id: string; text: string }) => ({
          ...opt,
          votes: responseCounts[opt.id] || 0,
          percentage: vote.totalEligible > 0 
            ? ((responseCounts[opt.id] || 0) / vote.totalVotes * 100).toFixed(1)
            : 0
        }));
      }

      return NextResponse.json({ vote, results });
    }

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID required' }, { status: 400 });
    }

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { propertyId };
    if (status) where.status = status;

    const votes = await db.condoVote.findMany({
      where,
      include: {
        _count: {
          select: { responses: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Stats
    const now = new Date().toISOString().split('T')[0];
    const stats = {
      total: votes.length,
      upcoming: votes.filter(v => v.status === 'upcoming').length,
      active: votes.filter(v => v.status === 'active').length,
      closed: votes.filter(v => v.status === 'closed').length,
      currentActive: votes.filter(v => v.status === 'active' && v.startDate <= now && v.endDate >= now).length,
    };

    return NextResponse.json({ votes, stats });
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 });
  }
}

// POST - Create new vote
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      propertyId,
      tenantId = 'default',
      title,
      description,
      type = 'simple',
      options,
      startDate,
      endDate,
      eligibleVoters = 'all_owners',
      requiresQuorum = true,
      quorumPercentage = 51,
      isAnonymous = true,
      createdBy,
      createdByName,
    } = body;

    // Calculate total eligible voters
    let totalEligible = 0;
    if (eligibleVoters === 'all_owners') {
      totalEligible = await db.condoOwner.count({
        where: { propertyId, isActive: true }
      });
    } else if (eligibleVoters === 'all_residents') {
      totalEligible = await db.condoResident.count({
        where: { propertyId, isActive: true }
      });
    }

    const vote = await db.condoVote.create({
      data: {
        propertyId,
        tenantId,
        title,
        description,
        type,
        options: typeof options === 'string' ? options : JSON.stringify(options),
        startDate,
        endDate,
        eligibleVoters,
        totalEligible,
        requiresQuorum,
        quorumPercentage,
        isAnonymous,
        createdBy,
        createdByName,
        status: 'upcoming',
      }
    });

    return NextResponse.json({ vote });
  } catch (error) {
    console.error('Error creating vote:', error);
    return NextResponse.json({ error: 'Failed to create vote' }, { status: 500 });
  }
}

// PUT - Update vote or submit response
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, residentId, response } = body;

    if (action === 'submit_vote' && residentId && response) {
      // Submit a vote response
      const existingResponse = await db.condoVoteResponse.findUnique({
        where: { voteId_residentId: { voteId: id, residentId } }
      });

      if (existingResponse) {
        return NextResponse.json({ error: 'Ya has votado en esta encuesta' }, { status: 400 });
      }

      // Create response and update vote count
      const [voteResponse, vote] = await Promise.all([
        db.condoVoteResponse.create({
          data: {
            voteId: id,
            residentId,
            propertyId: body.propertyId,
            response: typeof response === 'string' ? response : JSON.stringify(response),
          }
        }),
        db.condoVote.update({
          where: { id },
          data: { totalVotes: { increment: 1 } }
        })
      ]);

      return NextResponse.json({ voteResponse, vote });
    }

    // Regular update
    const vote = await db.condoVote.update({
      where: { id },
      data: body
    });

    return NextResponse.json({ vote });
  } catch (error) {
    console.error('Error updating vote:', error);
    return NextResponse.json({ error: 'Failed to update vote' }, { status: 500 });
  }
}

// DELETE - Cancel vote
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Vote ID required' }, { status: 400 });
    }

    const vote = await db.condoVote.update({
      where: { id },
      data: { status: 'cancelled' }
    });

    return NextResponse.json({ vote });
  } catch (error) {
    console.error('Error cancelling vote:', error);
    return NextResponse.json({ error: 'Failed to cancel vote' }, { status: 500 });
  }
}
