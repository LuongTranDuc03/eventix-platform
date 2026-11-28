package com.eventix.config.rabbitmq;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class RabbitMQConfig {

    // 1. Cấu hình luồng xuất vé bất đồng bộ
    public static final String TICKET_EXCHANGE = "ticket.exchange";
    public static final String TICKET_ISSUANCE_QUEUE = "ticket.issuance.queue";
    public static final String TICKET_ROUTING_KEY = "ticket.issuance.key";

    // 2. Cấu hình luồng Delayed Message để tự động hoàn vé sau 10 phút
    public static final String ORDER_DELAY_EXCHANGE = "order.delay.exchange";
    public static final String ORDER_RELEASE_QUEUE = "order.release.queue";
    public static final String ORDER_RELEASE_ROUTING_KEY = "order.release.key";

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

    // Custom Exchange kiểu x-delayed-message
    @Bean
    public CustomExchange orderDelayExchange() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-delayed-type", "direct");
        return new CustomExchange(ORDER_DELAY_EXCHANGE, "x-delayed-message", true, false, args);
    }

    @Bean
    public Queue orderReleaseQueue() {
        return new Queue(ORDER_RELEASE_QUEUE, true);
    }

    @Bean
    public Binding orderReleaseBinding(Queue orderReleaseQueue, CustomExchange orderDelayExchange) {
        return BindingBuilder.bind(orderReleaseQueue).to(orderDelayExchange).with(ORDER_RELEASE_ROUTING_KEY).noargs();
    }

    // Chuyển đổi định dạng message thành JSON chuẩn thay vì Java Binary Serialization
    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
