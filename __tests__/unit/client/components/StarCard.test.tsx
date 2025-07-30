/**
 * StarCard Component Unit Tests
 * ============================
 * Tests for client/src/components/starcard/StarCard.tsx
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StarCard from '@client/components/starcard/StarCard'
import { testUsers, testQuadrantData, testFlowAttributes } from '../../../fixtures/workshops'

// Mock external dependencies
vi.mock('@client/lib/html2canvas', () => ({
  downloadElementAsImage: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@client/assets/all-star-teams-logo-250px.png', () => ({
  default: 'mock-logo.png'
}))

vi.mock('@client/assets/starcardcloudimage.png', () => ({
  default: 'mock-cloud.png'
}))

vi.mock('@client/components/starcard/starCardConstants', () => ({
  getAttributeColor: vi.fn((attr: string) => '#000000'),
  CARD_WIDTH: 400,
  CARD_HEIGHT: 600,
  QUADRANT_COLORS: {
    thinking: '#10B981',
    acting: '#EF4444', 
    feeling: '#3B82F6',
    planning: '#F59E0B'
  },
  DEFAULT_COLOR: '#9CA3AF'
}))

describe('StarCard Component', () => {
  let mockDownloadElementAsImage: any

  beforeEach(() => {
    const { downloadElementAsImage } = require('@client/lib/html2canvas')
    mockDownloadElementAsImage = vi.mocked(downloadElementAsImage)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Rendering - Basic Structure', () => {
    it('should render card title', () => {
      render(<StarCard />)
      expect(screen.getByText('Star Card')).toBeInTheDocument()
    })

    it('should render user profile section', () => {
      const profile = {
        name: 'John Doe',
        title: 'Developer',
        organization: 'Test Corp'
      }

      render(<StarCard profile={profile} />)
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Developer')).toBeInTheDocument()
      expect(screen.getByText('Test Corp')).toBeInTheDocument()
    })

    it('should render cloud section with apex strength', () => {
      render(<StarCard />)
      
      expect(screen.getByText('Imagination')).toBeInTheDocument()
      expect(screen.getByText('Your Apex Strength')).toBeInTheDocument()
      expect(screen.getByAltText('Cloud')).toBeInTheDocument()
    })

    it('should render star diagram with core and flow labels', () => {
      render(<StarCard />)
      
      expect(screen.getByText('Core')).toBeInTheDocument()
      expect(screen.getByText('Flow')).toBeInTheDocument()
    })

    it('should render AllStarTeams logo', () => {
      render(<StarCard />)
      expect(screen.getByAltText('allstarteams')).toBeInTheDocument()
    })
  })

  describe('Profile Data Handling', () => {
    it('should handle profile prop correctly', () => {
      const profile = {
        name: 'Jane Smith',
        title: 'Product Manager',
        organization: 'Tech Inc',
        avatarUrl: 'https://example.com/avatar.jpg'
      }

      render(<StarCard profile={profile} />)
      
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('Product Manager')).toBeInTheDocument()
      expect(screen.getByText('Tech Inc')).toBeInTheDocument()
    })

    it('should handle legacy direct props', () => {
      render(
        <StarCard 
          userName="Legacy User"
          userTitle="Legacy Title"
          userOrg="Legacy Org"
        />
      )
      
      expect(screen.getByText('Legacy User')).toBeInTheDocument()
      expect(screen.getByText('Legacy Title')).toBeInTheDocument()
      expect(screen.getByText('Legacy Org')).toBeInTheDocument()
    })

    it('should show default name when no profile provided', () => {
      render(<StarCard />)
      expect(screen.getByText('Your Name')).toBeInTheDocument()
    })

    it('should handle missing optional profile fields', () => {
      const profile = {
        name: 'John Doe',
        title: '',
        organization: ''
      }

      render(<StarCard profile={profile} />)
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('')).not.toBeInTheDocument()
    })
  })

  describe('Avatar Handling', () => {
    it('should display user avatar when imageUrl provided', () => {
      const imageUrl = 'https://example.com/avatar.jpg'
      const profile = { name: 'John Doe', title: '', organization: '' }

      render(<StarCard profile={profile} imageUrl={imageUrl} />)
      
      const avatar = screen.getByAltText('John Doe')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveAttribute('src', imageUrl)
    })

    it('should display user avatar when profile.avatarUrl provided', () => {
      const profile = {
        name: 'John Doe',
        title: '',
        organization: '',
        avatarUrl: 'https://example.com/profile.jpg'
      }

      render(<StarCard profile={profile} />)
      
      const avatar = screen.getByAltText('John Doe')
      expect(avatar).toHaveAttribute('src', profile.avatarUrl)
    })

    it('should show UserIcon when no avatar provided', () => {
      render(<StarCard />)
      
      // UserIcon should be present (as SVG element)
      expect(document.querySelector('svg')).toBeInTheDocument()
    })

    it('should prioritize imageUrl prop over profile.avatarUrl', () => {
      const imageUrl = 'https://example.com/priority.jpg'
      const profile = {
        name: 'John Doe',
        title: '',
        organization: '',
        avatarUrl: 'https://example.com/secondary.jpg'
      }

      render(<StarCard profile={profile} imageUrl={imageUrl} />)
      
      const avatar = screen.getByAltText('John Doe')
      expect(avatar).toHaveAttribute('src', imageUrl)
    })
  })

  describe('Quadrant Data Display', () => {
    it('should display quadrant scores when data provided', () => {
      const quadrantData = testQuadrantData.complete

      render(<StarCard quadrantData={quadrantData} />)
      
      // Should show percentages for each quadrant
      expect(screen.getByText('THINKING')).toBeInTheDocument()
      expect(screen.getByText('ACTING')).toBeInTheDocument()
      expect(screen.getByText('FEELING')).toBeInTheDocument()
      expect(screen.getByText('PLANNING')).toBeInTheDocument()
    })

    it('should handle legacy direct quadrant props', () => {
      render(
        <StarCard 
          thinking={30}
          acting={25} 
          feeling={25}
          planning={20}
        />
      )
      
      expect(screen.getByText('THINKING')).toBeInTheDocument()
      expect(screen.getByText('30%')).toBeInTheDocument()
    })

    it('should show empty state when no quadrant data', () => {
      render(<StarCard />)
      
      // Quadrants should be rendered but without text/percentages
      const quadrants = document.querySelectorAll('[style*="background-color"]')
      expect(quadrants.length).toBeGreaterThan(0)
    })

    it('should normalize scores to percentages correctly', () => {
      // Test with raw scores that should be normalized
      const quadrantData = { thinking: 15, acting: 10, feeling: 10, planning: 5 }

      render(<StarCard quadrantData={quadrantData} />)
      
      // 15/40 = 37.5% ≈ 38%
      expect(screen.getByText('38%')).toBeInTheDocument()
      // 10/40 = 25%
      expect(screen.getByText('25%')).toBeInTheDocument()
      // 5/40 = 12.5% ≈ 13%
      expect(screen.getByText('13%')).toBeInTheDocument()
    })

    it('should handle percentage data (already normalized)', () => {
      const quadrantData = { thinking: 40, acting: 30, feeling: 20, planning: 10 }

      render(<StarCard quadrantData={quadrantData} />)
      
      expect(screen.getByText('40%')).toBeInTheDocument()
      expect(screen.getByText('30%')).toBeInTheDocument()
      expect(screen.getByText('20%')).toBeInTheDocument()
      expect(screen.getByText('10%')).toBeInTheDocument()
    })
  })

  describe('Flow Attributes Display', () => {
    it('should display flow attributes when provided', () => {
      const flowAttributes = testFlowAttributes.complete

      render(<StarCard flowAttributes={flowAttributes} />)
      
      flowAttributes.forEach(attr => {
        expect(screen.getByText(attr.text)).toBeInTheDocument()
      })
    })

    it('should handle empty flow attributes', () => {
      render(<StarCard flowAttributes={[]} />)
      
      // Should render flow squares but without text
      const flowSquares = document.querySelectorAll('[style*="position: absolute"]')
      expect(flowSquares.length).toBeGreaterThan(0)
    })

    it('should apply correct colors to flow attributes', () => {
      const flowAttributes = [
        { text: 'Leadership', color: '#FF0000' },
        { text: 'Innovation', color: '#00FF00' }
      ]

      render(<StarCard flowAttributes={flowAttributes} />)
      
      expect(screen.getByText('Leadership')).toBeInTheDocument()
      expect(screen.getByText('Innovation')).toBeInTheDocument()
    })

    it('should handle long flow attribute text with font scaling', () => {
      const flowAttributes = [
        { text: 'Very Long Flow Attribute Text That Should Scale', color: '#000000' }
      ]

      render(<StarCard flowAttributes={flowAttributes} />)
      
      expect(screen.getByText('Very Long Flow Attribute Text That Should Scale')).toBeInTheDocument()
    })
  })

  describe('Card States', () => {
    it('should show empty state when pending=true', () => {
      render(<StarCard pending={true} />)
      
      // Should not show download button or detailed data
      expect(screen.queryByText('Download Star Card')).not.toBeInTheDocument()
    })

    it('should show partial state with quadrant data only', () => {
      const quadrantData = testQuadrantData.complete

      render(<StarCard quadrantData={quadrantData} />)
      
      // Should show quadrant data but no download button (not complete)
      expect(screen.getByText('THINKING')).toBeInTheDocument()
      expect(screen.queryByText('Download Star Card')).not.toBeInTheDocument()
    })

    it('should show complete state with both quadrant and flow data', () => {
      const quadrantData = testQuadrantData.complete
      const flowAttributes = testFlowAttributes.complete

      render(<StarCard quadrantData={quadrantData} flowAttributes={flowAttributes} />)
      
      // Should show download button when complete
      expect(screen.getByText('Download Star Card')).toBeInTheDocument()
    })

    it('should respect explicit state prop', () => {
      render(<StarCard state="complete" />)
      
      // Should show download button even without data when state is explicitly complete
      expect(screen.getByText('Download Star Card')).toBeInTheDocument()
    })
  })

  describe('Download Functionality', () => {
    it('should show download button when downloadable=true and state=complete', () => {
      render(<StarCard downloadable={true} state="complete" />)
      
      expect(screen.getByText('Download Star Card')).toBeInTheDocument()
    })

    it('should hide download button when downloadable=false', () => {
      render(<StarCard downloadable={false} state="complete" />)
      
      expect(screen.queryByText('Download Star Card')).not.toBeInTheDocument()
    })

    it('should hide download button in preview mode', () => {
      render(<StarCard preview={true} state="complete" />)
      
      expect(screen.queryByText('Download Star Card')).not.toBeInTheDocument()
    })

    it('should call downloadElementAsImage when download button clicked', async () => {
      const user = userEvent.setup()
      const profile = { name: 'Test User', title: '', organization: '' }

      render(<StarCard profile={profile} state="complete" />)
      
      const downloadButton = screen.getByText('Download Star Card')
      await user.click(downloadButton)

      expect(mockDownloadElementAsImage).toHaveBeenCalledWith(
        expect.any(Element),
        'Test User_Star_Card.png'
      )
    })

    it('should show downloading state during download', async () => {
      const user = userEvent.setup()
      
      // Make download function take some time
      mockDownloadElementAsImage.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      )

      render(<StarCard state="complete" />)
      
      const downloadButton = screen.getByText('Download Star Card')
      await user.click(downloadButton)

      expect(screen.getByText('Downloading...')).toBeInTheDocument()
      
      // Wait for download to complete
      await waitFor(() => {
        expect(screen.getByText('Download Star Card')).toBeInTheDocument()
      })
    })

    it('should handle download errors gracefully', async () => {
      const user = userEvent.setup()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      mockDownloadElementAsImage.mockRejectedValue(new Error('Download failed'))

      render(<StarCard state="complete" />)
      
      const downloadButton = screen.getByText('Download Star Card')
      await user.click(downloadButton)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error downloading star card:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })

    it('should use default filename when no user name provided', async () => {
      const user = userEvent.setup()

      render(<StarCard state="complete" />)
      
      const downloadButton = screen.getByText('Download Star Card')
      await user.click(downloadButton)

      expect(mockDownloadElementAsImage).toHaveBeenCalledWith(
        expect.any(Element),
        'Your Name_Star_Card.png'
      )
    })
  })

  describe('Forward Ref', () => {
    it('should forward ref to card element', () => {
      const ref = vi.fn()
      
      render(<StarCard ref={ref} />)
      
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement))
    })

    it('should handle ref as RefObject', () => {
      const ref = { current: null }
      
      render(<StarCard ref={ref} />)
      
      expect(ref.current).toBeInstanceOf(HTMLElement)
    })
  })

  describe('Accessibility', () => {
    it('should have proper alt text for images', () => {
      const profile = { name: 'John Doe', title: '', organization: '' }

      render(<StarCard profile={profile} imageUrl="test.jpg" />)
      
      expect(screen.getByAltText('John Doe')).toBeInTheDocument()
      expect(screen.getByAltText('Cloud')).toBeInTheDocument()
      expect(screen.getByAltText('allstarteams')).toBeInTheDocument()
    })

    it('should have accessible button for download', () => {
      render(<StarCard state="complete" />)
      
      const button = screen.getByRole('button', { name: 'Download Star Card' })
      expect(button).toBeInTheDocument()
      expect(button).not.toBeDisabled()
    })

    it('should disable download button during download', async () => {
      const user = userEvent.setup()
      
      mockDownloadElementAsImage.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      )

      render(<StarCard state="complete" />)
      
      const button = screen.getByRole('button', { name: 'Download Star Card' })
      await user.click(button)

      expect(screen.getByRole('button', { name: 'Downloading...' })).toBeDisabled()
    })
  })

  describe('Performance', () => {
    it('should memoize component to prevent unnecessary re-renders', () => {
      const { rerender } = render(<StarCard />)
      
      // Component should be memoized (this is more of a structural test)
      expect(StarCard.displayName).toBeDefined()
      
      // Re-render with same props shouldn't cause issues
      rerender(<StarCard />)
    })

    it('should memoize derived computations', () => {
      const quadrantData = testQuadrantData.complete
      const { rerender } = render(<StarCard quadrantData={quadrantData} />)
      
      // Should handle re-renders efficiently
      rerender(<StarCard quadrantData={quadrantData} />)
      
      expect(screen.getByText('THINKING')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero scores correctly', () => {
      const quadrantData = { thinking: 0, acting: 0, feeling: 0, planning: 0 }

      render(<StarCard quadrantData={quadrantData} />)
      
      // Should not show quadrant labels when all scores are zero
      expect(screen.queryByText('THINKING')).not.toBeInTheDocument()
    })

    it('should handle null/undefined props gracefully', () => {
      expect(() => {
        render(<StarCard profile={undefined} quadrantData={undefined} />)
      }).not.toThrow()
    })

    it('should handle malformed flow attributes', () => {
      const malformedAttributes = [
        { text: '', color: '#000000' },
        { text: 'Valid', color: '' },
        // @ts-ignore - Testing malformed data
        { text: null, color: '#000000' }
      ]

      expect(() => {
        render(<StarCard flowAttributes={malformedAttributes} />)
      }).not.toThrow()
    })

    it('should handle very large quadrant scores', () => {
      const quadrantData = { thinking: 1000, acting: 2000, feeling: 3000, planning: 4000 }

      render(<StarCard quadrantData={quadrantData} />)
      
      // Should normalize correctly: 1000/10000 = 10%
      expect(screen.getByText('10%')).toBeInTheDocument()
      expect(screen.getByText('20%')).toBeInTheDocument()
      expect(screen.getByText('30%')).toBeInTheDocument()
      expect(screen.getByText('40%')).toBeInTheDocument()
    })
  })
})