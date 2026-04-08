import { motion } from "motion/react";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { useData } from "../context/DataContext";

export function BlogSection() {
  const { content } = useData();
  const { blog } = content;

  return (
    <section id="blog" className="relative py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {blog.heading}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {blog.intro}
          </p>
          <div className="w-24 h-1 bg-[#a855f7] mx-auto mt-6 rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blog.posts.map((post, index) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              whileHover={{ y: -8 }}
              className="group cursor-pointer"
            >
              <div className="h-full rounded-2xl bg-card border border-border hover:border-[#a855f7]/50 transition-all duration-300 shadow-sm overflow-hidden">
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-muted">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-[#a855f7] text-white font-medium">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-[#a855f7] transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center gap-2 text-[#a855f7] font-medium">
                    <span>Read More</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
