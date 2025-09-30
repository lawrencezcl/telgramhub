'use client';

import React, { memo, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Clock, ExternalLink } from 'lucide-react';

interface ChannelCardProps {
  channel: {
    id: string;
    title: string;
    username: string;
    description?: string;
    subscriberCount: number;
    category: string;
    metrics: {
      growthRate7d: number;
      postsPerDay: number;
      lastPostAt?: string;
    };
    tags: string[];
  };
  onClick?: (channelId: string) => void;
  onJoinClick?: (channelId: string) => void;
  lazy?: boolean;
}

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 16px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const Title = styled.h3`
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
`;

const Category = styled.span`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Metrics = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
`;

const Metric = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
`;

const Tag = styled.span`
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled(motion.button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Memoized metric formatter
const formatNumber = useMemo(() => (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}, []);

const ChannelCard: React.FC<ChannelCardProps> = memo(({
  channel,
  onClick,
  onJoinClick,
  lazy = true
}) => {
  const handleClick = () => {
    onClick?.(channel.id);
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onJoinClick?.(channel.id);
  };

  return (
    <Card
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
      loading={lazy ? 'lazy' : undefined}
    >
      <Header>
        <Title>{channel.title}</Title>
        <Category>{channel.category}</Category>
      </Header>

      {channel.description && (
        <Description>{channel.description}</Description>
      )}

      <Metrics>
        <Metric>
          <Users size={16} />
          {formatNumber(channel.subscriberCount)}
        </Metric>
        {channel.metrics.growthRate7d !== 0 && (
          <Metric>
            <TrendingUp size={16} />
            {channel.metrics.growthRate7d > 0 ? '+' : ''}
            {channel.metrics.growthRate7d.toFixed(1)}%
          </Metric>
        )}
        {channel.metrics.postsPerDay > 0 && (
          <Metric>
            <Clock size={16} />
            {channel.metrics.postsPerDay.toFixed(1)}/day
          </Metric>
        )}
      </Metrics>

      {channel.tags.length > 0 && (
        <Tags>
          {channel.tags.slice(0, 3).map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
          {channel.tags.length > 3 && (
            <Tag>+{channel.tags.length - 3}</Tag>
          )}
        </Tags>
      )}

      <Actions>
        {onJoinClick && (
          <Button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleJoinClick}
          >
            <ExternalLink size={16} />
            Join
          </Button>
        )}
      </Actions>
    </Card>
  );
});

ChannelCard.displayName = 'ChannelCard';

export default ChannelCard;