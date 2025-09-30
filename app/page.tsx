'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from 'react-query';
import styled, { ThemeProvider } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, TrendingUp, Users, Globe } from 'lucide-react';

import ChannelCard from '@/components/ChannelCard';
import { Channel, ChannelFilters } from '@/types/channel';

const theme = {
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    background: '#0a0a0a',
    surface: 'rgba(255, 255, 255, 0.05)',
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
  },
};

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  color: ${theme.colors.text};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const Header = styled.header`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${theme.colors.border};
  padding: 20px 0;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: ${theme.colors.textSecondary};
  margin: 0;
  font-size: 16px;
`;

const Controls = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchContainer = styled.div`
  flex: 1;
  min-width: 300px;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 44px;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  color: ${theme.colors.text};
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: ${theme.colors.textSecondary};
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.textSecondary};
`;

const FilterButton = styled.button`
  padding: 12px 20px;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  color: ${theme.colors.text};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: ${theme.colors.primary};
  }
`;

const Content = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.primary};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: 14px;
`;

const ChannelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${theme.colors.border};
  border-top-color: ${theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${theme.colors.textSecondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${theme.colors.textSecondary};
`;

// API hooks
const useChannels = (filters: ChannelFilters) => {
  return useQuery(
    ['channels', filters],
    async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.minSubscribers) params.append('minSubscribers', filters.minSubscribers.toString());
      if (filters.language) params.append('language', filters.language);
      if (filters.activity) params.append('activity', filters.activity);
      params.append('limit', '20');

      const response = await fetch(`/api/channels?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch channels');
      }
      return response.json();
    },
    {
      staleTime: 300000, // 5 minutes
      cacheTime: 600000, // 10 minutes
    }
  );
};

const useSearchChannels = (query: string) => {
  return useQuery(
    ['search-channels', query],
    async () => {
      const response = await fetch(`/api/channels/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search channels');
      }
      return response.json();
    },
    {
      enabled: query.length > 0,
      staleTime: 180000, // 3 minutes
      cacheTime: 360000, // 6 minutes
    }
  );
};

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ChannelFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: channelsData,
    isLoading: isLoadingChannels,
    error: channelsError
  } = useChannels(filters);

  const {
    data: searchData,
    isLoading: isLoadingSearch,
    error: searchError
  } = useSearchChannels(searchQuery);

  const channels = useMemo(() => {
    if (searchQuery && searchData) {
      return searchData.channels;
    }
    return channelsData?.channels || [];
  }, [searchQuery, searchData, channelsData]);

  const stats = useMemo(() => {
    if (!channelsData) return null;
    return {
      total: channelsData.pagination.totalItems,
      categories: new Set(channelsData.channels.map((c: Channel) => c.category)).size,
      avgSubscribers: Math.round(
        channelsData.channels.reduce((sum: number, c: Channel) => sum + c.subscriberCount, 0) /
        channelsData.channels.length
      ),
      activeLastDay: channelsData.channels.filter((c: Channel) =>
        c.metrics.lastPostAt && new Date(c.metrics.lastPostAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length
    };
  }, [channelsData]);

  const handleChannelClick = useCallback((channelId: string) => {
    // Handle channel click - navigate to details
    console.log('Channel clicked:', channelId);
  }, []);

  const handleJoinClick = useCallback(async (channelId: string) => {
    try {
      const response = await fetch(`/api/channels/${channelId}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.joinLink) {
        window.open(data.joinLink, '_blank');
      }
    } catch (error) {
      console.error('Failed to get join link:', error);
    }
  }, []);

  const isLoading = searchQuery ? isLoadingSearch : isLoadingChannels;
  const error = searchQuery ? searchError : channelsError;

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <Header>
          <HeaderContent>
            <Title>TelgramHub</Title>
            <Subtitle>Discover Popular Telegram Channels</Subtitle>
          </HeaderContent>
        </Header>

        <Controls>
          <SearchContainer>
            <SearchIcon size={20} />
            <SearchInput
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchContainer>

          <FilterButton onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} />
            Filters
          </FilterButton>
        </Controls>

        <Content>
          {stats && (
            <Stats>
              <StatCard>
                <StatValue>{stats.total.toLocaleString()}</StatValue>
                <StatLabel>Total Channels</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.categories}</StatValue>
                <StatLabel>Categories</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{formatNumber(stats.avgSubscribers)}</StatValue>
                <StatLabel>Avg. Subscribers</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.activeLastDay}</StatValue>
                <StatLabel>Active Today</StatLabel>
              </StatCard>
            </Stats>
          )}

          {isLoading && (
            <LoadingContainer>
              <LoadingSpinner />
            </LoadingContainer>
          )}

          {error && (
            <ErrorMessage>
              <p>Failed to load channels. Please try again.</p>
            </ErrorMessage>
          )}

          {!isLoading && !error && channels.length === 0 && (
            <EmptyState>
              <p>No channels found matching your criteria.</p>
            </EmptyState>
          )}

          <AnimatePresence>
            <ChannelGrid>
              {channels.map((channel: Channel, index: number) => (
                <motion.div
                  key={channel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ChannelCard
                    channel={channel}
                    onClick={handleChannelClick}
                    onJoinClick={handleJoinClick}
                  />
                </motion.div>
              ))}
            </ChannelGrid>
          </AnimatePresence>
        </Content>
      </AppContainer>
    </ThemeProvider>
  );
}

// Helper function
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}