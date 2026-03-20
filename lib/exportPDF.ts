import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function exportScorecardPDF(match: any, innings: any[], balls: any[]) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const primaryGreen = [34, 197, 94] as const
  const darkBg = [10, 14, 26] as const
  const cardBg = [17, 24, 39] as const

  // Header bar
  doc.setFillColor(...darkBg)
  doc.rect(0, 0, 210, 297, 'F')
  doc.setFillColor(...primaryGreen)
  doc.rect(0, 0, 210, 22, 'F')

  // Title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('SCOREVERSE', 14, 14)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('OFFICIAL SCORECARD', 140, 14)

  let yPos = 30

  // Match title
  const team1 = match.team1?.name || 'Team 1'
  const team2 = match.team2?.name || 'Team 2'
  doc.setFontSize(16)
  doc.setTextColor(...primaryGreen)
  doc.setFont('helvetica', 'bold')
  doc.text(`${team1} vs ${team2}`, 14, yPos)

  yPos += 8
  doc.setFontSize(10)
  doc.setTextColor(156, 163, 175)
  doc.setFont('helvetica', 'normal')
  const matchInfo = [
    match.tournament?.name && `${match.tournament.name} •`,
    `${match.total_overs} Overs`,
    match.venue && `• ${match.venue}`,
    `• ${new Date(match.created_at).toLocaleDateString()}`,
  ].filter(Boolean).join(' ')
  doc.text(matchInfo, 14, yPos)

  yPos += 8
  // Result
  if (match.status === 'completed' && match.winner_team_id) {
    const winnerName = match.winner_team_id === match.team1_id ? team1 : team2
    const resultStr = match.is_tie
      ? 'Match Tied'
      : match.win_by_runs
        ? `${winnerName} won by ${match.win_by_runs} runs`
        : `${winnerName} won by ${match.win_by_wickets} wickets`
    doc.setTextColor(...primaryGreen)
    doc.setFont('helvetica', 'bold')
    doc.text(`Result: ${resultStr}`, 14, yPos)
    yPos += 5
  }

  // Innings sections
  for (const inn of innings) {
    yPos += 8

    // Innings header
    const battingTeamName = match.team1_id === inn.batting_team_id ? team1 : team2
    doc.setFillColor(...cardBg)
    doc.roundedRect(12, yPos - 4, 186, 10, 2, 2, 'F')
    doc.setTextColor(...primaryGreen)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`${battingTeamName} - ${inn.innings_number === 1 ? '1st' : '2nd'} Innings`, 16, yPos + 2)

    const score = `${inn.total_runs}/${inn.total_wickets} (${inn.total_overs}.${inn.total_balls} ov)`
    doc.text(score, 190, yPos + 2, { align: 'right' })
    yPos += 12

    // Batting table - calculate from balls
    const inningsBalls = balls.filter(b => b.innings_id === inn.id)
    const batsmanMap: Record<string, any> = {}
    inningsBalls.forEach(ball => {
      const bid = ball.batsman_id
      if (!batsmanMap[bid]) {
        batsmanMap[bid] = { name: ball.batsman?.name || bid, runs: 0, balls: 0, fours: 0, sixes: 0, out: false, dismissal: '' }
      }
      if (!ball.extra_type || ball.extra_type === 'no_ball') batsmanMap[bid].balls++
      if (!ball.extra_type) {
        batsmanMap[bid].runs += ball.runs
        if (ball.runs === 4) batsmanMap[bid].fours++
        if (ball.runs === 6) batsmanMap[bid].sixes++
      }
      if (ball.is_wicket) {
        batsmanMap[bid].out = true
        batsmanMap[bid].dismissal = ball.wicket_type || 'Out'
      }
    })

    const battingRows = Object.values(batsmanMap).map((b: any) => [
      b.name,
      b.out ? b.dismissal : 'not out',
      b.runs.toString(),
      b.balls.toString(),
      b.fours.toString(),
      b.sixes.toString(),
      b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0',
    ])

    if (battingRows.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [['Batsman', 'Dismissal', 'R', 'B', '4s', '6s', 'SR']],
        body: battingRows,
        theme: 'plain',
        styles: { fillColor: [17, 24, 39], textColor: [249, 250, 251], fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [31, 41, 55], textColor: [156, 163, 175], fontSize: 8 },
        columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 45 } },
        margin: { left: 12, right: 12 },
      })
      yPos = (doc as any).lastAutoTable.finalY + 5
    }

    // Extras & total
    doc.setTextColor(156, 163, 175)
    doc.setFontSize(9)
    doc.text(`Extras: ${inn.extras} (wd: ${inn.wide_count || 0}, nb: ${inn.no_ball_count || 0})`, 14, yPos)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(34, 197, 94)
    doc.text(`TOTAL: ${inn.total_runs}/${inn.total_wickets}  (${inn.total_overs}.${inn.total_balls} overs)`, 130, yPos)
    doc.setFont('helvetica', 'normal')
    yPos += 6

    // Bowling table
    const bowlerMap: Record<string, any> = {}
    inningsBalls.forEach(ball => {
      const wid = ball.bowler_id
      if (!bowlerMap[wid]) {
        bowlerMap[wid] = { name: ball.bowler?.name || wid, runs: 0, balls: 0, wickets: 0, wides: 0, noBalls: 0 }
      }
      bowlerMap[wid].runs += ball.runs + (ball.extras || 0)
      if (!ball.extra_type || ball.extra_type === 'bye' || ball.extra_type === 'leg_bye') bowlerMap[wid].balls++
      if (ball.extra_type === 'wide') bowlerMap[wid].wides++
      if (ball.extra_type === 'no_ball') bowlerMap[wid].noBalls++
      if (ball.is_wicket && !['run_out'].includes(ball.wicket_type)) bowlerMap[wid].wickets++
    })

    const bowlingRows = Object.values(bowlerMap).map((b: any) => {
      const overs = `${Math.floor(b.balls / 6)}.${b.balls % 6}`
      const totalBalls = b.balls || 1
      const econ = ((b.runs / (totalBalls / 6)) || 0).toFixed(2)
      return [b.name, overs, b.runs.toString(), b.wickets.toString(), econ, b.wides.toString(), b.noBalls.toString()]
    })

    if (bowlingRows.length > 0) {
      doc.setTextColor(156, 163, 175)
      doc.setFontSize(9)
      doc.text('Bowling', 14, yPos)
      yPos += 3
      autoTable(doc, {
        startY: yPos,
        head: [['Bowler', 'O', 'R', 'W', 'Econ', 'Wd', 'Nb']],
        body: bowlingRows,
        theme: 'plain',
        styles: { fillColor: [17, 24, 39], textColor: [249, 250, 251], fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [31, 41, 55], textColor: [156, 163, 175], fontSize: 8 },
        columnStyles: { 0: { cellWidth: 55 } },
        margin: { left: 12, right: 12 },
      })
      yPos = (doc as any).lastAutoTable.finalY + 5
    }

    if (inn.target) {
      doc.setTextColor(245, 158, 11)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(`Target: ${inn.target}`, 14, yPos)
      yPos += 5
      doc.setFont('helvetica', 'normal')
    }
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height
  doc.setFillColor(...primaryGreen)
  doc.rect(0, pageHeight - 12, 210, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Generated by ScoreVerse · All rights reserved to Prajwal Korgaonkar', 105, pageHeight - 5, { align: 'center' })

  doc.save(`scorecard-${match.share_token || 'match'}.pdf`)
}
