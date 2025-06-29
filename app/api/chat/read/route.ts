import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { conversationId, messageId, userId } = await request.json()

    if (!conversationId || !messageId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get authorization header
    const authorization = request.headers.get('authorization')
    if (!authorization) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Extract token from authorization header
    const token = authorization.replace('JWT ', '')
    
    try {
      // Update conversation participants with new lastReadMessage
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || ''
      
      // First, get the current conversation
      const conversationResponse = await fetch(`${apiUrl}/api/conversations/${conversationId}`, {
        headers: {
          Authorization: `JWT ${token}`,
        },
      })

      if (!conversationResponse.ok) {
        throw new Error('Failed to fetch conversation')
      }

      const conversation = await conversationResponse.json()
      
      // Update the participants array with new lastReadMessage
      const updatedParticipants = conversation.participants.map((p: any) =>
        p.user.id === userId ? { ...p, lastReadMessage: messageId } : p
      )

      // Update the conversation
      const updateResponse = await fetch(`${apiUrl}/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `JWT ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participants: updatedParticipants }),
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to update conversation')
      }

      return NextResponse.json({ 
        success: true,
        message: `Message ${messageId} marked as read by user ${userId}`
      })

    } catch (error) {
      console.error('Failed to update read status:', error)
      return NextResponse.json(
        { error: 'Failed to update read status' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Read API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 