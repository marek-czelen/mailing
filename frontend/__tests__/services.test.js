/**
 * Testy serwisów i komponentów - Frontend
 * 
 * Uruchomienie: npm test
 */
import { describe, test, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

// Mock axios
vi.mock('axios')

// Import serwisów
import { Account } from '../src/services/account'
import { Campaigns } from '../src/services/campaigns'
import { MailingService } from '../src/services/mailing'
import { Templates } from '../src/services/templates'
import { Databases } from '../src/services/databases'
import { AiService } from '../src/services/ai'
import { UsersService } from '../src/services/users'

// ======================== ACCOUNT SERVICE ========================
describe('Account Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('getCurrentUser powinien pobrać dane użytkownika', async () => {
    const mockUser = { id: 1, email: 'test@test.com', customerId: 1 }
    axios.get.mockResolvedValueOnce({ data: { data: mockUser, success: true } })

    const user = await Account.getCurrentUser()
    expect(user).toEqual(mockUser)
    expect(axios.get).toHaveBeenCalledWith('/auth/me')
  })

  test('getCurrentUser powinien zwrócić null przy błędzie', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'))
    const user = await Account.getCurrentUser()
    expect(user).toBeNull()
  })

  test('getCurrentCustomerId powinien zwrócić ID klienta', async () => {
    const mockUser = { id: 1, email: 'test@test.com', customerId: 42 }
    axios.get.mockResolvedValueOnce({ data: { data: mockUser, success: true } })

    const id = await Account.getCurrentCustomerId()
    expect(id).toBe(42)
  })

  test('requestPasswordReset powinien wysłać adres email', async () => {
    axios.post.mockResolvedValueOnce({ status: 200 })

    const result = await Account.requestPasswordReset('test@test.com')

    expect(result).toBe(true)
    expect(axios.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'test@test.com' })
  })

  test('resetPassword powinien wysłać token i nowe hasło', async () => {
    axios.post.mockResolvedValueOnce({ status: 200 })

    const result = await Account.resetPassword('token', 'NewPassword123')

    expect(result).toBe(true)
    expect(axios.post).toHaveBeenCalledWith('/auth/reset-password', {
      token: 'token',
      password: 'NewPassword123'
    })
  })

})

// ======================== CAMPAIGNS SERVICE ========================
describe('Campaigns Service', () => {
  test('getList powinien pobrać listę kampanii', async () => {
    const mockList = [{ id: 1, name: 'Test' }]
    axios.get.mockResolvedValueOnce({ data: { data: mockList, success: true } })

    const list = await Campaigns.getList()
    expect(list).toEqual(mockList)
    expect(axios.get).toHaveBeenCalledWith('/mailing/getCampaignsList')
  })

  test('getCampaignById powinien pobrać kampanię', async () => {
    const mockCampaign = { id: 1, name: 'Test', subject: 'Hello' }
    axios.get.mockResolvedValueOnce({ data: { data: mockCampaign, success: true } })

    const campaign = await Campaigns.getCampaignById(1)
    expect(campaign).toEqual(mockCampaign)
    expect(axios.get).toHaveBeenCalledWith('/mailing/getCampaignById/1')
  })

  test('create powinien utworzyć kampanię', async () => {
    const mockCreated = { id: 2, name: 'New' }
    axios.post.mockResolvedValueOnce({ data: { data: mockCreated, success: true } })

    const result = await Campaigns.create({ name: 'New', subject: 'Test' })
    expect(result).toEqual(mockCreated)
  })

  test('delete powinien usunąć kampanię', async () => {
    axios.delete.mockResolvedValueOnce({ data: { success: true } })
    await Campaigns.delete(1)
    expect(axios.delete).toHaveBeenCalledWith('/mailing/deleteCampaign/1')
  })

  test('sendTestEmail powinien przekazać ID kampanii', async () => {
    axios.post.mockResolvedValueOnce({ data: { response: { success: true } } })

    await MailingService.sendTestEmail(
      'test@example.com',
      'Test',
      '{{UNSUBSCRIBE_LINK}}',
      { host: 'smtp.example.com', port: 587, user: 'sender@example.com', pass: 'secret' },
      12
    )

    expect(axios.post).toHaveBeenCalledWith('/mailing/sendEmail', expect.objectContaining({
      campaignId: 12,
      html: '{{UNSUBSCRIBE_LINK}}'
    }))
  })
})

// ======================== TEMPLATES SERVICE ========================
describe('Templates Service', () => {
  test('getTemplates powinien pobrać szablony', async () => {
    const mockTemplates = [{ id: 1, name: 'Template 1' }]
    axios.get.mockResolvedValueOnce({ data: { data: mockTemplates, success: true } })

    const templates = await Templates.getTemplates()
    expect(templates).toEqual(mockTemplates)
  })

  test('createTemplate powinien utworzyć szablon', async () => {
    const mockTemplate = { id: 1, name: 'New Template' }
    axios.post.mockResolvedValueOnce({ data: { data: mockTemplate, success: true } })

    const result = await Templates.createTemplate({
      name: 'New Template',
      description: 'Desc',
      category: 'Newsletter',
      tags: ['test'],
      blocks: []
    })
    expect(result).toEqual(mockTemplate)
    expect(axios.post).toHaveBeenCalledWith('/templates', expect.any(Object), expect.any(Object))
  })

  test('deleteTemplate powinien usunąć szablon', async () => {
    axios.delete.mockResolvedValueOnce({ data: { success: true } })
    const result = await Templates.deleteTemplate(1)
    expect(result).toBe(true)
  })
})

// ======================== DATABASES SERVICE ========================
describe('Databases Service', () => {
  test('getList powinien pobrać bazy danych', async () => {
    // Mock Account.getCurrentCustomerId call wewnętrzny
    axios.get.mockResolvedValueOnce({ data: { data: { customerId: 1 }, success: true } })
    const mockDbs = [{ id: 1, name: 'DB 1' }]
    axios.get.mockResolvedValueOnce({ data: { data: mockDbs, success: true } })

    const dbs = await Databases.getList()
    expect(dbs).toEqual(mockDbs)
  })

  test('createDatabase powinien utworzyć bazę', async () => {
    const mockDb = { id: 1, name: 'New DB' }
    axios.post.mockResolvedValueOnce({ data: { data: mockDb, success: true } })

    const result = await Databases.create({ name: 'New DB' })
    expect(result).toEqual(mockDb)
  })
})

// ======================== AI SERVICE ========================
describe('AI Service', () => {
  test('generateContent powinien wygenerować treść', async () => {
    const mockContent = '<p>Generated content</p>'
    axios.post.mockResolvedValueOnce({ data: { data: mockContent, success: true } })

    const result = await AiService.generateContent('Test prompt')
    expect(result).toBe(mockContent)
    expect(axios.post).toHaveBeenCalledWith('/mailing/generateMailContent', expect.any(Object))
  })

  test('generateSubject powinien wygenerować temat', async () => {
    const mockSubject = 'Great offer!'
    axios.post.mockResolvedValueOnce({ data: { data: mockSubject, success: true } })

    const result = await AiService.generateSubject('Summer sale')
    expect(result).toBe(mockSubject)
  })

  test('improveText powinien poprawić tekst', async () => {
    const mockImproved = 'Improved text'
    axios.post.mockResolvedValueOnce({ data: { data: mockImproved, success: true } })

    const result = await AiService.improveText('Original text', 'professional')
    expect(result).toBe(mockImproved)
  })

  test('generateCTA powinien wygenerować CTA', async () => {
    const mockCTAs = 'Buy Now\nShop Today\nGet Yours'
    axios.post.mockResolvedValueOnce({ data: { data: mockCTAs, success: true } })

    const result = await AiService.generateCTA('Summer sale')
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  test('checkSpamScore powinien sprawdzić spam', async () => {
    const mockScore = { score: 15, rating: 'Good' }
    axios.post.mockResolvedValueOnce({ data: { data: mockScore, success: true } })

    const result = await AiService.checkSpamScore(1)
    expect(result).toEqual(mockScore)
  })
})

// ======================== USERS SERVICE ========================
describe('Users Service', () => {
  test('getUsers powinien pobrać użytkowników', async () => {
    // Mock getCurrentCustomerId
    axios.get.mockResolvedValueOnce({ data: { data: { customerId: 1 }, success: true } })
    const mockUsers = [{ id: 1, email: 'test@test.com' }]
    axios.get.mockResolvedValueOnce({ data: { data: mockUsers, success: true } })

    const users = await UsersService.getUsers()
    expect(users).toEqual(mockUsers)
  })

  test('createUser powinien utworzyć użytkownika', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: { customerId: 1 }, success: true } })
    const mockUser = { id: 2, email: 'new@test.com' }
    axios.post.mockResolvedValueOnce({ data: { data: mockUser, success: true } })

    const result = await UsersService.createUser({ email: 'new@test.com', password: 'Test123!' })
    expect(result).toEqual(mockUser)
  })

  test('deleteUser powinien usunąć użytkownika', async () => {
    axios.delete.mockResolvedValueOnce({ data: { success: true } })
    const result = await UsersService.deleteUser(1)
    expect(result).toBe(true)
  })

  test('ROLES powinny być zdefiniowane', () => {
    expect(UsersService.ROLES).toBeDefined()
    expect(UsersService.ROLES.ADMINISTRATOR).toBe('administrator')
    expect(UsersService.ROLES.MARKETER).toBe('marketer')
  })
})

// ======================== TESTY BRZEGOWE ========================
describe('Edge Cases', () => {
  test('serwisy powinny obsługiwać błędy sieciowe', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network Error'))
    
    await expect(Campaigns.getList()).rejects.toThrow('Network Error')
  })

  test('serwisy powinny obsługiwać puste odpowiedzi', async () => {
    axios.get.mockResolvedValueOnce({ data: {} })
    
    const result = await Campaigns.getList()
    expect(result).toBeUndefined()
  })

  test('Account.isLoggedIn powinien zwrócić false bez tokenu', () => {
    localStorage.removeItem('auth_token')
    expect(Account.IsLoggedIn()).toBe(false)
  })

  test('Account.isLoggedIn powinien zwrócić true z tokenem', () => {
    localStorage.setItem('auth_token', 'test-token')
    expect(Account.IsLoggedIn()).toBe(true)
    localStorage.removeItem('auth_token')
  })

  test('Account.logout powinien usunąć token', () => {
    localStorage.setItem('auth_token', 'test-token')
    expect(localStorage.getItem('auth_token')).toBe('test-token')
    Account.logout()
    expect(localStorage.getItem('auth_token')).toBeNull()
  })
})
