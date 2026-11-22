package com.eventix.config.rabbitmq;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String TICKET_EXCHANGE = "ticket.exchange";
    public static final String TICKET_ISSUANCE_QUEUE = "ticket.issuance.queue";
    public static final String TICKET_ROUTING_KEY = "ticket.issuance.key";

    @Bean
    public TopicExchange ticketExchange() {
        return new TopicExchange(TICKET_EXCHANGE);
    }

    @Bean
    public Queue ticketIssuanceQueue() {
        return new Queue(TICKET_ISSUANCE_QUEUE, true); // durable = true
    }

    @Bean
    public Binding ticketBinding(Queue ticketIssuanceQueue, TopicExchange ticketExchange) {
        return BindingBuilder.bind(ticketIssuanceQueue).to(ticketExchange).with(TICKET_ROUTING_KEY);
    }

    // Chuyển đổi định dạng message thành JSON chuẩn thay vì Java Binary Serialization
    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}